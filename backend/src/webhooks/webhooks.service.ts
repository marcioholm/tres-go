import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class WebhooksService {
    constructor(
        private prisma: PrismaService,
        private conversationsService: ConversationsService,
        private gateway: AppGateway
    ) { }

    verifyWhatsapp(mode: string, token: string): boolean {
        // Simplified check. Real world: fetch config from DB.
        return mode === 'subscribe' && token === 'northway_omni_token';
    }

    async processWhatsappMessage(workspaceId: string, body: any) {
        // 1. Extract data (simplified for brevity, assumes standard WhatsApp Webhook structure)
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        const contact = value?.contacts?.[0];

        if (!message) return;

        const senderPhone = message.from;
        const senderName = contact?.profile?.name || senderPhone;
        const messageBody = message.text?.body || message.type; // Handle other types later

        // 2. Find or Create Contact
        let dbContact = await this.prisma.contact.findFirst({
            where: { workspaceId, phone: senderPhone }
        });

        if (!dbContact) {
            dbContact = await this.prisma.contact.create({
                data: {
                    workspaceId,
                    name: senderName,
                    phone: senderPhone
                }
            });
        }

        // 3. Find Open Conversation
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                workspaceId,
                contactId: dbContact.id,
                status: 'OPEN'
            }
        });

        // 4. Create Conversation if none exists
        if (!conversation) {
            // Find a valid channel
            const channel = await this.prisma.channel.findFirst({
                where: { workspaceId, type: 'whatsapp' }
            });

            if (!channel) {
                console.error(`No WhatsApp channel found for workspace ${workspaceId}`);
                return;
            }

            conversation = await this.conversationsService.create(workspaceId, {
                contactId: dbContact.id,
                channelId: channel.id,
                messageBody, // For auto-routing
                contactPhone: senderPhone // For auto-routing
            });
        }

        // 5. Create Message
        const newMessage = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: { text: messageBody },
                type: message.type || 'text',
                status: 'RECEIVED',
                fromAgent: false,
                externalId: message.id
            }
        });

        // Emit socket event via Gateway
        if (conversation.sectorId) {
            this.gateway.emitToSector(workspaceId, conversation.sectorId, 'newMessage', {
                conversationId: conversation.id,
                message: newMessage
            });
        } else {
            this.gateway.emitToWorkspace(workspaceId, 'newMessage', {
                conversationId: conversation.id,
                message: newMessage
            });
        }
    }

    // TODO: Emit socket event via Gateway
}
