import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class MetaWebhookService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
        private readonly conversationsService: ConversationsService,
        private readonly messagesService: MessagesService,
    ) { }

    validateSignature(body: any, signature: string): boolean {
        if (!signature) return false;
        const expected = crypto
            .createHmac('sha256', process.env.META_APP_SECRET || '')
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === `sha256=${expected}`;
    }

    async processWebhook(body: any) {
        try {
            const entries = body.entry || [];

            for (const entry of entries) {
                const pageId = entry.id;

                // Buscar o canal pelo pageId
                const channel = await this.prisma.channel.findFirst({
                    where: { pageId, status: 'ACTIVE' },
                });

                if (!channel) continue;

                // Processar mensagens (Instagram DM + Messenger compartilham esse formato)
                const messaging = entry.messaging || entry.changes?.[0]?.value?.messages || [];

                for (const event of messaging) {
                    if (event.message) {
                        await this.handleIncomingMessage(channel, event);
                    } else if (event.read) {
                        await this.handleMessageRead(channel, event);
                    } else if (event.delivery) {
                        await this.handleMessageDelivery(channel, event);
                    }
                }

                // WhatsApp tem estrutura diferente
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === 'messages') {
                            await this.handleWhatsAppWebhook(channel, change.value);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Webhook processing error:', err);
        }
    }

    private async handleIncomingMessage(channel: any, event: any) {
        const senderId = event.sender.id;
        const text = event.message?.text || '';
        const attachments = event.message?.attachments || [];
        const mid = event.message?.mid;

        // Buscar ou criar contato (precisamos de um nome, usamos o ID como fallback se não houver perfil)
        const contact = await this.contactsService.findOrCreate(channel.workspaceId, senderId);

        // Buscar ou criar conversa
        const conversation = await this.conversationsService.findOrCreate(
            channel.workspaceId,
            channel.id,
            contact.id,
        );

        // Salvar mensagem
        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                externalId: mid,
                fromAgent: false,
                type: attachments.length > 0 ? 'ATTACHMENT' : 'TEXT',
                content: {
                    text: text,
                    attachments: attachments.map((a: any) => ({
                        type: a.type,
                        url: a.payload?.url,
                    })),
                },
                status: 'SENT',
                createdAt: new Date(event.timestamp)
            }
        });
    }

    private async handleWhatsAppWebhook(channel: any, value: any) {
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        for (const msg of messages) {
            const phone = msg.from;
            const waContact = contacts.find((c: any) => c.wa_id === phone);
            const senderName = waContact?.profile?.name || phone;

            const contact = await this.contactsService.findOrCreate(channel.workspaceId, phone, senderName);
            const conversation = await this.conversationsService.findOrCreate(
                channel.workspaceId,
                channel.id,
                contact.id
            );

            await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    externalId: msg.id,
                    fromAgent: false,
                    type: (msg.type || 'TEXT').toUpperCase(),
                    content: {
                        text: msg.text?.body || msg.caption || '',
                        attachments: msg.image || msg.video || msg.document
                            ? [{ type: msg.type, id: msg.image?.id || msg.video?.id || msg.document?.id }]
                            : [],
                    },
                    status: 'SENT',
                    createdAt: new Date(parseInt(msg.timestamp) * 1000),
                }
            });
        }
    }

    private async handleMessageRead(channel: any, event: any) {
        await this.prisma.message.updateMany({
            where: {
                conversation: { channelId: channel.id },
                externalId: { in: event.read?.watermark ? [] : [event.read?.mid] },
            },
            data: { status: 'READ' },
        });
    }

    private async handleMessageDelivery(channel: any, event: any) {
        await this.prisma.message.updateMany({
            where: {
                conversation: { channelId: channel.id },
                externalId: { in: event.delivery?.mids || [] },
            },
            data: { status: 'DELIVERED' },
        });
    }
}
