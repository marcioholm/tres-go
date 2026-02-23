import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduledStatus } from '@prisma/client';

@Injectable()
export class ScheduledMessagesService {
  constructor(
    @InjectQueue('scheduled-messages') private scheduledMessagesQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async create(workspaceId: string, data: any) {
    let {
      conversationId,
      agentId,
      type,
      content,
      scheduledAt,
      mediaUrl,
      mediaType,
    } = data;
    let { channelId } = data;

    // Extract from nested content if it's an object (new frontend format)
    if (content && typeof content === 'object') {
      mediaUrl = mediaUrl || content.mediaUrl;
      mediaType = mediaType || content.mediaType;
      if (content.isPtt) {
        type = 'AUDIO';
      }
    }

    // Fetch conversation if channelId is missing
    if (!channelId) {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (conversation) {
        channelId = conversation.channelId;
      } else {
        throw new Error('Conversation not found');
      }
    }

    // 1. Create record in DB
    const scheduledMessage = await this.prisma.scheduledMessage.create({
      data: {
        workspaceId,
        conversationId,
        channelId,
        agentId,
        type:
          type ||
          (mediaUrl
            ? content?.isPtt
              ? 'AUDIO'
              : mediaType || 'TEXT'
            : 'TEXT'),
        content:
          typeof content === 'object'
            ? content
            : { text: content, mediaUrl, mediaType },
        scheduledAt: new Date(scheduledAt),
        status: ScheduledStatus.PENDING,
      },
    });

    // 2. Add to Queue with delay
    const delay = new Date(scheduledAt).getTime() - Date.now();

    if (delay > 0) {
      await this.scheduledMessagesQueue.add(
        'send-message',
        {
          scheduledMessageId: scheduledMessage.id,
          messageParams: {
            workspaceId, // CRITICAL: Added missing workspaceId
            conversationId,
            type: type || 'TEXT',
            fromAgent: true,
            status: 'PENDING',
            content:
              typeof content === 'object'
                ? content
                : { text: content, mediaUrl, mediaType },
          },
        },
        { delay, jobId: scheduledMessage.id },
      );
    }

    return scheduledMessage;
  }

  async findAll(workspaceId: string, conversationId?: string) {
    return this.prisma.scheduledMessage.findMany({
      where: {
        workspaceId,
        ...(conversationId && { conversationId }),
        status: 'PENDING',
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async cancel(workspaceId: string, id: string) {
    // Remove from queue
    const job = await this.scheduledMessagesQueue.getJob(id);
    if (job) {
      await job.remove();
    }

    // Update DB
    return this.prisma.scheduledMessage.update({
      where: { id, workspaceId },
      data: { status: ScheduledStatus.CANCELLED },
    });
  }
}
