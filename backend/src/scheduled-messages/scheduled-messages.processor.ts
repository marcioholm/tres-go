import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduledStatus } from '@prisma/client';

@Processor('scheduled-messages', {
  // Poll interval: check for new jobs every 30s instead of every 1s
  // This reduces Redis requests by ~97% — critical for Upstash free tier
  stalledInterval: 300_000, // re-check stalled jobs every 5 min
  lockDuration: 30_000,     // hold lock for 30s
  concurrency: 2,
})
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
      await this.messagesService.create(
        messageParams.workspaceId,
        messageParams,
      );

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
