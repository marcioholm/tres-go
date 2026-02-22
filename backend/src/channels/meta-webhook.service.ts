import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { AppGateway } from '../gateway/app.gateway';
import { decrypt } from '../utils/crypto.util';

@Injectable()
export class MetaWebhookService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
        private readonly conversationsService: ConversationsService,
        private readonly messagesService: MessagesService,
        private readonly gateway: AppGateway,
    ) { }

    validateSignature(rawBody: Buffer, signature: string): boolean {
        if (!signature) return false;

        const expected = crypto
            .createHmac('sha256', process.env.META_APP_SECRET || '')
            .update(rawBody)
            .digest('hex');

        const actual = signature.startsWith('sha256=') ? signature.split('=')[1] : signature;

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expected, 'hex'),
            Buffer.from(actual, 'hex')
        );

        if (!isValid) {
            console.error('[Meta Webhook] Signature mismatch!', { expected, actual });
        }

        return isValid;
    }

    async processWebhook(body: any) {
        try {
            console.log('[Meta Webhook] Incoming body:', JSON.stringify(body));
            const entries = body.entry || [];

            for (const entry of entries) {
                const entryId = entry.id;

                // Processar mensagens (Instagram DM + Messenger compartilham esse formato)
                const messaging = entry.messaging || entry.changes?.[0]?.value?.messages || [];

                for (const event of messaging) {
                    // 1. Tentar encontrar o canal específico pelo recipient.id (mais preciso para distinguir IG de Messenger)
                    const recipientId = event.recipient?.id;
                    let channel = null;

                    if (recipientId) {
                        channel = await this.prisma.channel.findFirst({
                            where: {
                                OR: [
                                    { pageId: recipientId, status: 'ACTIVE' },
                                    { igAccountId: recipientId, status: 'ACTIVE' }
                                ]
                            }
                        });
                    }

                    // 2. Fallback para o entryId (ID da Página que disparou o webhook)
                    if (!channel) {
                        channel = await this.prisma.channel.findFirst({
                            where: {
                                OR: [
                                    { pageId: entryId, status: 'ACTIVE' },
                                    { igAccountId: entryId, status: 'ACTIVE' },
                                ],
                            },
                        });
                    }

                    if (!channel) {
                        console.log(`[Meta Webhook] No active channel found for entry: ${entryId}, recipient: ${recipientId}`);
                        continue;
                    }

                    console.log(`[Meta Webhook] Processing event for channel: ${channel.name} (${channel.id})`);

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
                        console.log(`[Meta Webhook] Change field: ${change.field}`);
                        if (change.field === 'messages') {
                            // Localizar canal WhatsApp
                            const channel = await this.prisma.channel.findFirst({
                                where: { pageId: entryId, type: 'WHATSAPP', status: 'ACTIVE' }
                            });
                            if (channel) {
                                await this.handleWhatsAppWebhook(channel, change.value);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Meta Webhook] processing error:', err);
        }
    }

    private async handleIncomingMessage(channel: any, event: any) {
        const senderId = event.sender.id;
        const text = event.message?.text || '';
        const attachments = event.message?.attachments || [];
        const mid = event.message?.mid;

        // Buscar nome do perfil via API da Meta se for Instagram
        let profileName = undefined;
        try {
            if (channel.type === 'INSTAGRAM' || channel.type === 'MESSENGER') {
                const token = channel.accessToken ? decrypt(channel.accessToken) : process.env.META_SYSTEM_USER_TOKEN;
                console.log(`[Meta Webhook] Fetching profile for ${senderId} using token starting with ${token?.substring(0, 10)}...`);

                const profileRes = await fetch(
                    `https://graph.facebook.com/v19.0/${senderId}?fields=name`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const profileData = await profileRes.json();

                if (profileData.name) {
                    profileName = profileData.name;
                    console.log(`[Meta Webhook] SUCCESS: Fetched profile name for ${senderId}: ${profileName}`);
                } else {
                    console.warn(`[Meta Webhook] Profile data returned no name:`, profileData);
                }
            }
        } catch (error) {
            console.error('[Meta Webhook] CRITICAL: Failed to fetch profile name:', error.message);
        }

        // Buscar ou criar contato (usando o perfil se encontrado)
        const contact = await this.contactsService.findOrCreate(channel.workspaceId, senderId, profileName);

        // Buscar ou criar conversa
        const conversation = await this.conversationsService.findOrCreate(
            channel.workspaceId,
            channel.id,
            contact.id,
        );

        // Salvar mensagem
        const messageContent = text; // User requested normalization to string for simple text

        const message = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                externalId: mid,
                fromAgent: false,
                type: attachments.length > 0 ? 'ATTACHMENT' : 'TEXT',
                content: attachments.length > 0 ? {
                    text: text,
                    attachments: attachments.map((a: any) => ({
                        type: a.type,
                        url: a.payload?.url,
                    })),
                } : text,
                status: 'SENT',
                createdAt: new Date(event.timestamp)
            }
        });

        // Emit socket event via Gateway
        const socketMessage = {
            ...message,
            text: typeof message.content === 'string' ? message.content : (message.content as any)?.text || ''
        };

        this.gateway.emitToWorkspace(channel.workspaceId, 'newMessage', {
            conversationId: conversation.id,
            message: socketMessage
        });

        console.log('Mensagem salva e emitida:', message.id);
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

            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    externalId: msg.id,
                    fromAgent: false,
                    type: (msg.type || 'TEXT').toUpperCase(),
                    content: msg.text?.body || msg.caption || '',
                    status: 'SENT',
                    createdAt: new Date(parseInt(msg.timestamp) * 1000),
                }
            });

            this.gateway.emitToWorkspace(channel.workspaceId, 'newMessage', {
                conversationId: conversation.id,
                message: {
                    ...message,
                    text: typeof message.content === 'string' ? message.content : (message.content as any)?.text || ''
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
