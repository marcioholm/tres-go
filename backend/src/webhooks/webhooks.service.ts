import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ContactsService } from '../contacts/contacts.service';
import { SessionService } from '../performance/session.service';
import { AppGateway } from '../gateway/app.gateway';
import { KeywordDetectorService } from '../pipelines/keyword-detector.service';
import { UploadsService } from '../uploads/uploads.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private conversationsService: ConversationsService,
    private contactsService: ContactsService,
    private sessionService: SessionService,
    private gateway: AppGateway,
    private keywordDetector: KeywordDetectorService,
    private uploadsService: UploadsService,
    @InjectQueue('webhooks-processing') private webhooksQueue: Queue,
  ) { }

  async enqueueWebhookEvent(provider: string, payload: any, metadata: { phoneNumberId?: string; instanceId?: string }) {
    const externalId = provider === 'ZAPI'
      ? (payload.zaapId || payload.messageId)
      : (payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id);

    // 1. Save to DB
    const event = await this.prisma.webhookEvent.create({
      data: {
        provider,
        payload,
        externalId,
        instanceId: metadata.instanceId,
        phoneNumberId: metadata.phoneNumberId,
        status: 'PENDING',
      },
    });

    // 2. Add to Queue
    await this.webhooksQueue.add('process-webhook', { eventId: event.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    return event;
  }

  verifyWhatsapp(mode: string, token: string): boolean {
    // Simplified check. Real world: fetch config from DB.
    return mode === 'subscribe' && token === 'northway_omni_token';
  }

  async findChannelByPhoneId(phoneNumberId: string) {
    return this.prisma.channel.findFirst({
      where: { phoneNumberId },
    });
  }
}
