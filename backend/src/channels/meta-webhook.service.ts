import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MetaWebhookService {
    constructor(
        private readonly prisma: PrismaService,
        // Note: In a full implementation, these would be injected
        // private readonly conversationsService: ConversationsService,
        // private readonly messagesService: MessagesService,
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

        // TODO: Integrate with ConversationsService and MessagesService
        console.log(`Incoming message from ${senderId} on channel ${channel.id}: ${text}`);

        /*
        const conversation = await this.conversationsService.findOrCreate({
          channelId: channel.id,
          workspaceId: channel.workspaceId,
          externalId: senderId,
          channelType: channel.type,
        });
    
        await this.messagesService.create({
          conversationId: conversation.id,
          externalId: mid,
          direction: 'INBOUND',
          type: attachments.length > 0 ? 'ATTACHMENT' : 'TEXT',
          content: text,
          attachments: attachments.map((a: any) => ({
            type: a.type,
            url: a.payload?.url,
          })),
          receivedAt: new Date(event.timestamp * 1000),
        });
        */
    }

    private async handleWhatsAppWebhook(channel: any, value: any) {
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        for (const msg of messages) {
            const phone = msg.from;
            const contact = contacts.find((c: any) => c.wa_id === phone);
            const senderName = contact?.profile?.name || phone;

            console.log(`Incoming WhatsApp message from ${phone} (${senderName}) on channel ${channel.id}: ${msg.text?.body || ''}`);

            /*
            const conversation = await this.conversationsService.findOrCreate({
              channelId: channel.id,
              workspaceId: channel.workspaceId,
              externalId: phone,
              channelType: 'WHATSAPP',
              contactName: senderName,
            });
      
            await this.messagesService.create({
              conversationId: conversation.id,
              externalId: msg.id,
              direction: 'INBOUND',
              type: msg.type.toUpperCase(),
              content: msg.text?.body || msg.caption || '',
              attachments: msg.image || msg.video || msg.document
                ? [{ type: msg.type, id: msg.image?.id || msg.video?.id || msg.document?.id }]
                : [],
              receivedAt: new Date(parseInt(msg.timestamp) * 1000),
            });
            */
        }
    }

    private async handleMessageRead(channel: any, event: any) {
        console.log(`Message read on channel ${channel.id}`);
        /*
        await this.prisma.message.updateMany({
          where: {
            conversation: { channelId: channel.id },
            externalId: { in: event.read?.watermark ? [] : [event.read?.mid] },
          },
          data: { status: 'READ' },
        });
        */
    }

    private async handleMessageDelivery(channel: any, event: any) {
        console.log(`Message delivered on channel ${channel.id}`);
        /*
        await this.prisma.message.updateMany({
          where: {
            conversation: { channelId: channel.id },
            externalId: { in: event.delivery?.mids || [] },
          },
          data: { status: 'DELIVERED' },
        });
        */
    }
}
