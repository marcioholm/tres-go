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
            if (event.provider === 'ZAPI') {
                await this.processZapi(event);
            } else {
                await this.processWhatsapp(event);
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

    private async processZapi(event: any) {
        const body = event.payload;
        const instanceId = event.instanceId;

        // 1. Optimized Channel Lookup
        let channel = await this.prisma.channel.findUnique({
            where: { zapiInstanceId: instanceId },
        });

        if (!channel) {
            // Fallback to searching config (slow)
            const channels = await this.prisma.channel.findMany({ where: { type: 'WHATSAPP' } });
            channel = channels.find((c: any) => {
                const config = typeof c.config === 'string' ? JSON.parse(c.config) : c.config;
                return config?.instanceId === instanceId;
            });

            if (channel) {
                // Cache it for next time
                await this.prisma.channel.update({
                    where: { id: channel.id },
                    data: { zapiInstanceId: instanceId },
                });
            }
        }

        if (!channel) throw new Error(`Channel not found for Z-API instance ${instanceId}`);

        const workspaceId = channel.workspaceId;
        const rawPhone = body.phone;
        const senderPhone = this.normalizePhone(rawPhone);
        const senderName = body.senderName || senderPhone;
        const externalId = body.zaapId || body.messageId;
        const isFromMe = body.fromMe === true;

        // 2. Find/Create Contact
        const dbContact = await this.contactsService.findOrCreate(workspaceId, senderPhone, senderName, body.photo);

        // 3. Find/Create Conversation
        let conversation = await this.prisma.conversation.findFirst({
            where: { workspaceId, contactId: dbContact.id, status: 'OPEN' },
        });

        if (!conversation) {
            conversation = await this.conversationsService.create(workspaceId, {
                contactId: dbContact.id,
                channelId: channel.id,
                messageBody: body.text?.message || body.message || 'Nova conversa',
                contactPhone: senderPhone,
            });
        }

        // 4. Handle Media
        const mediaUrl = body.audio || body.image || body.video || body.document || body.sticker;
        const status = mediaUrl ? 'PENDING_DOWNLOAD' : (isFromMe ? 'SENT' : 'RECEIVED');

        // 5. Create Message with Transaction and Sequence
        const message = await this.createMessageTransactional({
            conversationId: conversation.id,
            channelId: channel.id,
            workspaceId,
            externalId,
            fromAgent: isFromMe,
            type: (body.type || 'text').toUpperCase(),
            content: { text: body.text?.message || body.message || '', originalUrl: mediaUrl },
            status,
            providerTimestamp: body.timestamp ? new Date(body.timestamp * 1000) : new Date(),
        });

        // 6. trigger media processing if needed
        if (mediaUrl) {
            await this.mediaQueue.add('download-media', { messageId: message.id });
        }

        // 7. Post-processing (socket, keywords)
        await this.postProcessMessage(workspaceId, conversation, dbContact, message, channel.type);
    }

    private async processWhatsapp(event: any) {
        const body = event.payload;
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        const contact = value?.contacts?.[0];

        if (!message) return;

        const channel = await this.prisma.channel.findFirst({
            where: { phoneNumberId: event.phoneNumberId },
        });
        if (!channel) throw new Error(`Channel not found for WhatsApp Phone ID ${event.phoneNumberId}`);

        const workspaceId = channel.workspaceId;
        const senderPhone = message.from;
        const senderName = contact?.profile?.name || senderPhone;
        const externalId = message.id;

        const dbContact = await this.contactsService.findOrCreate(workspaceId, senderPhone, senderName);

        let conversation = await this.prisma.conversation.findFirst({
            where: { workspaceId, contactId: dbContact.id, status: 'OPEN' },
        });

        if (!conversation) {
            conversation = await this.conversationsService.create(workspaceId, {
                contactId: dbContact.id,
                channelId: channel.id,
                messageBody: message.text?.body || message.type,
                contactPhone: senderPhone,
            });
        }

        const hasMedia = ['image', 'audio', 'video', 'document', 'sticker', 'voice'].includes(message.type);
        const status = hasMedia ? 'PENDING_DOWNLOAD' : 'RECEIVED';

        const newMessage = await this.createMessageTransactional({
            conversationId: conversation.id,
            channelId: channel.id,
            workspaceId,
            externalId,
            fromAgent: false,
            type: message.type.toUpperCase(),
            content: { text: message.text?.body || '', type: message.type },
            status,
            providerTimestamp: new Date(parseInt(message.timestamp) * 1000),
        });

        if (hasMedia) {
            await this.mediaQueue.add('download-media', { messageId: newMessage.id, whatsappMediaId: message[message.type].id });
        }

        await this.postProcessMessage(workspaceId, conversation, dbContact, newMessage, 'WHATSAPP');
    }

    private async createMessageTransactional(params: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check for duplicate
            if (params.externalId) {
                const existing = await tx.message.findFirst({
                    where: { channelId: params.channelId, externalId: params.externalId },
                });
                if (existing) return existing;
            }

            // 2. Increment lastSeq
            const conversation = await tx.conversation.update({
                where: { id: params.conversationId },
                data: { lastSeq: { increment: 1 } },
            });

            // 3. Create message
            return tx.message.create({
                data: {
                    conversationId: params.conversationId,
                    channelId: params.channelId,
                    externalId: params.externalId,
                    fromAgent: params.fromAgent,
                    type: params.type,
                    content: params.content,
                    status: params.status,
                    sequence: conversation.lastSeq,
                    providerTimestamp: params.providerTimestamp,
                },
            });
        });
    }

    private async postProcessMessage(workspaceId: string, conversation: any, contact: any, message: any, channelType: string) {
        const text = (message.content as any).text || '';

        await this.keywordDetector.detect(text, conversation.id, workspaceId, conversation.sectorId).catch(() => { });
        await this.sessionService.trackClientMessage(conversation.id).catch(() => { });

        const socketMessage = {
            ...message,
            text,
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
