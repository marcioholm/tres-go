import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';
import { ScheduledMessagesService } from '../scheduled-messages/scheduled-messages.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class CampaignsService {
    private readonly logger = new Logger(CampaignsService.name);

    constructor(
        private prisma: PrismaService,
        private channelsService: ChannelsService,
        private scheduledMessagesService: ScheduledMessagesService,
        @InjectQueue('campaign-steps') private campaignQueue: Queue,
        private billing: BillingService
    ) { }

    async findAll(workspaceId: string) {
        return this.prisma.campaign.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(workspaceId: string, id: string) {
        return this.prisma.campaign.findUnique({ where: { id } });
    }

    async create(workspaceId: string, data: any) {
        const limitInfo = await this.billing.checkLimit(workspaceId, 'campaigns');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de campanhas ativas excedido.`);
        }

        return this.prisma.campaign.create({
            data: {
                ...data,
                workspaceId,
                status: 'DRAFT',
                type: data.type || 'SIMPLE',
                config: data.config || {}
            }
        });
    }

    async start(workspaceId: string, id: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign) throw new Error("Campaign not found");

        if (campaign.status === 'RUNNING' || campaign.status === 'COMPLETED') {
            return { success: false, message: "Campaign already running or completed" };
        }

        // 1. Fetch Contacts based on filters
        const whereClause: any = { workspaceId };

        if (campaign.filterSource) {
            whereClause.source = campaign.filterSource;
        }

        if (campaign.filterTagIds && campaign.filterTagIds.length > 0) {
            whereClause.ContactToTag = {
                some: {
                    tagId: { in: campaign.filterTagIds }
                }
            };
        }

        const contacts = await this.prisma.contact.findMany({
            where: whereClause,
            include: { conversations: { where: { workspaceId }, take: 1 } } // Try to find existing conversation
        });

        if (contacts.length === 0) {
            return { success: false, message: "No contacts found for this audience" };
        }

        // 2. Schedule Messages or Create Logs for Multi-step
        if (campaign.type === 'MULTI_STEP') {
            const steps = await this.prisma.campaignStep.findMany({
                where: { campaignId: id },
                orderBy: { order: 'asc' }
            });

            if (steps.length === 0) {
                return { success: false, message: "Campaign has no steps configured." };
            }

            for (const contact of contacts) {
                const conversationId = contact.conversations?.[0]?.id;
                if (!conversationId) continue;

                const firstStep = steps[0];

                const log = await this.prisma.campaignContactLog.upsert({
                    where: { campaignId_contactId: { campaignId: id, contactId: contact.id } },
                    update: { status: 'ACTIVE', currentStepId: firstStep.id, nextExecutionAt: new Date() },
                    create: {
                        campaignId: id,
                        contactId: contact.id,
                        status: 'ACTIVE',
                        currentStepId: firstStep.id,
                        nextExecutionAt: new Date()
                    }
                });

                // Add to BullMQ
                await this.campaignQueue.add('step', {
                    campaignId: id,
                    contactId: contact.id,
                    stepIndex: 0
                });
            }

        } else {
            // Simple campaign classic logic
            let delayAccumulator = 0;
            const delayStep = campaign.delayBetween || 3000;
            const startTime = new Date().getTime();

            for (const contact of contacts) {
                let conversationId = contact.conversations?.[0]?.id;
                if (!conversationId) continue;

                const scheduledAt = new Date(startTime + delayAccumulator);

                await this.scheduledMessagesService.create(workspaceId, {
                    conversationId,
                    agentId: campaign.workspaceId,
                    type: campaign.mediaUrl ? (campaign.mediaType || 'image') : 'text',
                    content: campaign.content || '',
                    scheduledAt: scheduledAt,
                    mediaUrl: campaign.mediaUrl,
                    mediaType: campaign.mediaType
                });

                delayAccumulator += delayStep;
            }
        }

        await this.prisma.campaign.update({
            where: { id },
            data: { status: 'RUNNING' }
        });

        return { success: true, message: `Campaign started for ${contacts.length} contacts.` };
    }

    async pause(workspaceId: string, id: string) {
        return this.prisma.campaign.update({
            where: { id },
            data: { status: 'PAUSED' }
        });
    }

    async delete(workspaceId: string, id: string) {
        return this.prisma.campaign.delete({ where: { id } });
    }

    // --- Motor de Re-escalonamento de Campanhas ---
    @Cron(CronExpression.EVERY_MINUTE)
    async processCampaigns() {
        // Encontrar logs ativos que precisam de execução agora
        const pendingLogs = await this.prisma.campaignContactLog.findMany({
            where: {
                status: 'ACTIVE',
                nextExecutionAt: { lte: new Date() }
            },
            include: {
                campaign: true
            }
        });

        if (pendingLogs.length === 0) return;

        this.logger.log(`[Campaign Cron] Found ${pendingLogs.length} pending campaign steps to execute.`);

        for (const log of pendingLogs) {
            try {
                // Descobrir o index do step atual
                const steps = await this.prisma.campaignStep.findMany({
                    where: { campaignId: log.campaignId },
                    orderBy: { order: 'asc' }
                });

                const stepIndex = steps.findIndex(s => s.id === log.currentStepId);

                if (stepIndex !== -1) {
                    await this.campaignQueue.add('step', {
                        campaignId: log.campaignId,
                        contactId: log.contactId,
                        stepIndex
                    });

                    // Temporariamente pausar a execução agendada para este log 
                    // para evitar execuções duplicadas antes do processador terminar
                    await this.prisma.campaignContactLog.update({
                        where: { id: log.id },
                        data: { nextExecutionAt: new Date(Date.now() + 3600000) } // +1 hora (será sobrescrito pelo processador)
                    });
                }
            } catch (err) {
                this.logger.error(`Failed to seed queue for log ${log.id}`, err);
            }
        }
    }
}
