import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduledStatus } from '@prisma/client';

@Processor('scheduled-messages')
export class ScheduledMessagesProcessor extends WorkerHost {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        console.log(`Processing scheduled message job ${job.id}`);
        const { messageParams, scheduledMessageId, file } = job.data;

        try {
            // Send the message
            await this.messagesService.create(messageParams.workspaceId, messageParams);

            // Update status to SENT
            if (scheduledMessageId) {
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduledMessageId },
                    data: { status: ScheduledStatus.SENT },
                });
            }
        } catch (error) {
            console.error(`Failed to send scheduled message ${job.id}`, error);
            if (scheduledMessageId) {
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduledMessageId },
                    data: { status: ScheduledStatus.FAILED },
                });
            }
            throw error;
        }
    }
}
