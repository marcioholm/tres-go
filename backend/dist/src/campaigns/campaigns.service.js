"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const channels_service_1 = require("../channels/channels.service");
const scheduled_messages_service_1 = require("../scheduled-messages/scheduled-messages.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const billing_service_1 = require("../billing/billing.service");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    constructor(prisma, channelsService, scheduledMessagesService, campaignQueue, billing) {
        this.prisma = prisma;
        this.channelsService = channelsService;
        this.scheduledMessagesService = scheduledMessagesService;
        this.campaignQueue = campaignQueue;
        this.billing = billing;
        this.logger = new common_1.Logger(CampaignsService_1.name);
    }
    async findAll(workspaceId) {
        return this.prisma.campaign.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(workspaceId, id) {
        return this.prisma.campaign.findUnique({ where: { id } });
    }
    async create(workspaceId, data) {
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
    async start(workspaceId, id) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign)
            throw new Error("Campaign not found");
        if (campaign.status === 'RUNNING' || campaign.status === 'COMPLETED') {
            return { success: false, message: "Campaign already running or completed" };
        }
        const whereClause = { workspaceId };
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
            include: { conversations: { where: { workspaceId }, take: 1 } }
        });
        if (contacts.length === 0) {
            return { success: false, message: "No contacts found for this audience" };
        }
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
                if (!conversationId)
                    continue;
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
                await this.campaignQueue.add('step', {
                    campaignId: id,
                    contactId: contact.id,
                    stepIndex: 0
                });
            }
        }
        else {
            let delayAccumulator = 0;
            const delayStep = campaign.delayBetween || 3000;
            const startTime = new Date().getTime();
            for (const contact of contacts) {
                let conversationId = contact.conversations?.[0]?.id;
                if (!conversationId)
                    continue;
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
    async pause(workspaceId, id) {
        return this.prisma.campaign.update({
            where: { id },
            data: { status: 'PAUSED' }
        });
    }
    async delete(workspaceId, id) {
        return this.prisma.campaign.delete({ where: { id } });
    }
    async processCampaigns() {
        const pendingLogs = await this.prisma.campaignContactLog.findMany({
            where: {
                status: 'ACTIVE',
                nextExecutionAt: { lte: new Date() }
            },
            include: {
                campaign: true
            }
        });
        if (pendingLogs.length === 0)
            return;
        this.logger.log(`[Campaign Cron] Found ${pendingLogs.length} pending campaign steps to execute.`);
        for (const log of pendingLogs) {
            try {
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
                    await this.prisma.campaignContactLog.update({
                        where: { id: log.id },
                        data: { nextExecutionAt: new Date(Date.now() + 3600000) }
                    });
                }
            }
            catch (err) {
                this.logger.error(`Failed to seed queue for log ${log.id}`, err);
            }
        }
    }
};
exports.CampaignsService = CampaignsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignsService.prototype, "processCampaigns", null);
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('campaign-steps')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channels_service_1.ChannelsService,
        scheduled_messages_service_1.ScheduledMessagesService,
        bullmq_2.Queue,
        billing_service_1.BillingService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map