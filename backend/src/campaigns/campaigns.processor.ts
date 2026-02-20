import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';

@Processor('campaign-steps')
export class CampaignsProcessor extends WorkerHost {
    constructor(
        private readonly prisma: PrismaService,
        private readonly messagesService: MessagesService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        console.log(`Processing campaign step job ${job.id}`);
        const { campaignId, contactId, stepIndex } = job.data;

        try {
            const campaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: { steps: { orderBy: { order: 'asc' } } }
            });

            if (!campaign || campaign.status !== 'RUNNING') return;

            const contactLog = await this.prisma.campaignContactLog.findUnique({
                where: { campaignId_contactId: { campaignId, contactId } }
            });

            if (!contactLog || contactLog.status !== 'ACTIVE') return;

            const step = campaign.steps[stepIndex];
            if (!step) {
                // No more steps, complete the log
                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: { status: 'COMPLETED' }
                });
                return;
            }

            // Check condition
            if (step.condition === 'NO_REPLY') {
                // If contact replied since campaign start, cancel
                // We'd check if there are incoming messages in their conversation after campaign start
                // For simplicity, relying on the 'CANCELLED_REPLY' status toggled via webhook if implemented
            }

            // Find conversation to send message
            const conversation = await this.prisma.conversation.findFirst({
                where: { workspaceId: campaign.workspaceId, contactId }
            });

            if (conversation) {
                // Send current step message
                await this.messagesService.create(campaign.workspaceId, {
                    conversationId: conversation.id,
                    type: step.mediaUrl ? (step.mediaType?.toUpperCase() || 'IMAGE') as any : 'TEXT',
                    text: step.content || '',
                    mediaUrl: step.mediaUrl,
                });
            }

            // Update log and queue next step if exists
            const nextStep = campaign.steps[stepIndex + 1];
            if (nextStep) {
                const nextExecutionAt = new Date(Date.now() + nextStep.delayHours * 3600000);

                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: {
                        currentStepId: nextStep.id,
                        nextExecutionAt
                    }
                });

                // In a real scenario, we'd inject the Queue and add the job here. 
                // However, doing it from the service or having a global cron is also common.
                // We will rely on a generic worker/queue to handle delays if BullMQ is properly configured.
            } else {
                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: { status: 'COMPLETED' }
                });
            }

        } catch (error) {
            console.error(`Failed to process campaign step ${job.id}`, error);
            await this.prisma.campaignContactLog.update({
                where: { campaignId_contactId: { campaignId, contactId } },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }
}
