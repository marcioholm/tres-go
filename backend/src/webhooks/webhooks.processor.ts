import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from './webhooks.service';
import { normalizeMessageContent } from '../messages/utils/message-utils';
import { AppGateway } from '../gateway/app.gateway';
import { KeywordDetectorService } from '../pipelines/keyword-detector.service';
import { SessionService } from '../performance/session.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ContactsService } from '../contacts/contacts.service';
import { MessageIngestService, NormalizedIncomingMessage } from './message-ingest.service';
import { MessageType, MediaStatus, MessageProvider } from '@prisma/client';

@Processor('webhooks-processing', {
    concurrency: 5,
})
export class WebhooksProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private webhooksService: WebhooksService,
        private gateway: AppGateway,
        private keywordDetector: KeywordDetectorService,
        private sessionService: SessionService,
        private conversationsService: ConversationsService,
        private contactsService: ContactsService,
        private ingestService: MessageIngestService,
        @InjectQueue('media-processing') private mediaQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any>): Promise<any> {
        const { eventId } = job.data;
        const event = await this.prisma.webhookEvent.findUnique({
            where: { id: eventId },
        });

        if (!event || event.status === 'PROCESSED') return;

        try {
            let normalized: NormalizedIncomingMessage | null = null;
            if (event.provider === 'ZAPI') {
                normalized = this.ingestService.normalizeZapi(event.instanceId, event.payload);
            } else if (event.provider === 'WHATSAPP') {
                normalized = this.ingestService.normalizeWhatsappCloud(event.phoneNumberId, event.payload);
            }

            if (normalized) {
                await this.processNormalizedMessage(normalized);
            }

            await this.prisma.webhookEvent.update({
                where: { id: eventId },
                data: { status: 'PROCESSED', processedAt: new Date() },
            });
        } catch (error) {
            console.error(`Error processing webhook event ${eventId}:`, error);
            await this.prisma.webhookEvent.update({
                where: { id: eventId },
                data: { status: 'ERROR', error: error.message },
            });
            throw error;
        }
    }

    private async processNormalizedMessage(msg: NormalizedIncomingMessage) {
        // 1. Resolve Channel
        let channel;
        if (msg.provider === MessageProvider.ZAPI) {
            channel = await this.prisma.channel.findUnique({
                where: { zapiInstanceId: msg.channelKey },
            });
        } else if (msg.provider === MessageProvider.WA_CLOUD) {
            channel = await this.prisma.channel.findFirst({
                where: { phoneNumberId: msg.channelKey },
            });
        }

        if (!channel) throw new Error(`Channel not found for ${msg.provider} key ${msg.channelKey}`);

        const workspaceId = channel.workspaceId;

        // 2. Find/Create Contact
        const dbContact = await this.contactsService.findOrCreate(
            workspaceId,
            msg.contact.phone,
            msg.contact.name,
            undefined // avatarUrl support later
        );

        // 3. Find/Create Conversation
        let conversation = await this.prisma.conversation.findFirst({
            where: { workspaceId, contactId: dbContact.id, status: 'OPEN' },
        });

        if (!conversation) {
            conversation = await this.conversationsService.create(workspaceId, {
                contactId: dbContact.id,
                channelId: channel.id,
                messageBody: msg.text || 'Nova conversa',
                contactPhone: msg.contact.phone,
            });
        }

        // 4. Handle Monotone Sequencing and Deduplication
        const message = await this.prisma.$transaction(async (tx) => {
            // Check for duplicate
            const existing = await tx.message.findUnique({
                where: {
                    channelId_provider_providerMessageId: {
                        channelId: channel.id,
                        provider: msg.provider,
                        providerMessageId: msg.providerMessageId,
                    }
                }
            });

            if (existing) return existing;

            // Increment lastSeq
            const updatedConversation = await tx.conversation.update({
                where: { id: conversation.id },
                data: { lastSeq: { increment: 1 } },
            });

            const status = msg.media ? MediaStatus.PENDING : (msg.fromMe ? 'SENT' : 'RECEIVED');

            // Create Message
            return tx.message.create({
                data: {
                    conversationId: conversation.id,
                    workspaceId,
                    channelId: channel.id,
                    fromAgent: msg.fromMe,
                    type: msg.type,
                    content: { text: msg.text, ...(msg.media ? { originalUrl: msg.media.url } : {}) },
                    status,
                    provider: msg.provider,
                    providerMessageId: msg.providerMessageId,
                    providerTimestamp: msg.providerTimestamp,
                    sequence: updatedConversation.lastSeq,
                    mediaOriginalUrl: msg.media?.url,
                    mediaStatus: msg.media ? MediaStatus.PENDING : MediaStatus.NONE,
                    reactionEmoji: msg.reaction?.emoji,
                    reactionTargetProviderMessageId: msg.reaction?.targetProviderMessageId,
                }
            });
        });

        // 5. Trigger Media Processing if needed
        if (msg.media && message.mediaStatus === MediaStatus.PENDING) {
            await this.mediaQueue.add('download-media', {
                messageId: message.id,
                whatsappMediaId: msg.provider === MessageProvider.WA_CLOUD ? msg.media.url : undefined
            }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 2000 }
            });
        }

        // 6. Post-processing (socket, keywords, session)
        await this.postProcessMessage(workspaceId, conversation, dbContact, message, channel.type);
    }

    private async postProcessMessage(workspaceId: string, conversation: any, contact: any, message: any, channelType: string) {
        const text = (message.content as any)?.text || '';

        await this.keywordDetector.detect(text, conversation.id, workspaceId, conversation.sectorId).catch(() => { });
        await this.sessionService.trackClientMessage(conversation.id).catch(() => { });

        const socketMessage = {
            ...message,
            text,
            mediaUrl: message.mediaFinalUrl || message.mediaOriginalUrl,
            mediaType: message.type,
        };

        const emitPayload = {
            conversationId: conversation.id,
            channelType,
            message: socketMessage,
            contact,
        };

        if (conversation.sectorId) {
            this.gateway.emitToSector(workspaceId, conversation.sectorId, 'newMessage', emitPayload);
        } else {
            this.gateway.emitToWorkspace(workspaceId, 'newMessage', emitPayload);
        }
    }

    private normalizePhone(phone: string): string {
        if (!phone) return '';
        return phone.replace(/^\+/, '').split('@')[0];
    }
}
