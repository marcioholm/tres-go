import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ContactsService } from '../contacts/contacts.service';
import { SessionService } from '../performance/session.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private conversationsService: ConversationsService,
    private contactsService: ContactsService,
    private sessionService: SessionService,
    private gateway: AppGateway,
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
      where: { workspaceId, phone: senderPhone },
    });

    if (!dbContact) {
      dbContact = await this.prisma.contact.create({
        data: {
          workspaceId,
          name: senderName,
          phone: senderPhone,
        },
      });
    }

    // 3. Find Open Conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        workspaceId,
        contactId: dbContact.id,
        status: 'OPEN',
      },
    });

    // 4. Create Conversation if none exists
    if (!conversation) {
      // Find a valid channel
      const channel = await this.prisma.channel.findFirst({
        where: { workspaceId, type: 'WHATSAPP' },
      });

      if (!channel) {
        console.error(`No WhatsApp channel found for workspace ${workspaceId}`);
        return;
      }

      conversation = await this.conversationsService.create(workspaceId, {
        contactId: dbContact.id,
        channelId: channel.id,
        messageBody, // For auto-routing
        contactPhone: senderPhone, // For auto-routing
      });
    }

    // 5. Create Message
    const newMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageBody, // Normalized to string
        type: message.type || 'text',
        status: 'RECEIVED',
        fromAgent: false,
        externalId: message.id,
      },
    });

    const socketMessage = {
      ...newMessage,
      text:
        typeof newMessage.content === 'string'
          ? newMessage.content
          : (newMessage.content as any)?.text || '',
    };

    // Emit socket event via Gateway
    if (conversation.sectorId) {
      this.gateway.emitToSector(
        workspaceId,
        conversation.sectorId,
        'newMessage',
        {
          conversationId: conversation.id,
          channelType: 'WHATSAPP',
          message: socketMessage,
        },
      );
    } else {
      this.gateway.emitToWorkspace(workspaceId, 'newMessage', {
        conversationId: conversation.id,
        channelType: 'WHATSAPP',
        message: socketMessage,
      });
    }
  }

  async processZapiMessage(instanceId: string, body: any) {
    // Z-API payload has 'phone', 'text.message', 'connectedPhone' etc.
    // Documentation: https://developer.z-api.io/webhooks/whatsapp/received

    // 1. Find Workspace by Instance ID
    const channel = await this.prisma.channel.findFirst({
      where: {
        config: {
          path: ['instanceId'],
          equals: instanceId,
        },
      },
    });

    if (!channel) {
      console.error(`No channel found for Z-API instance ${instanceId}`);
      return;
    }

    const workspaceId = channel.workspaceId;

    // 2. Extract Data
    const senderPhone = body.phone;
    const senderName = body.senderName || senderPhone;
    const avatarUrl = body.photo;
    const messageBody =
      body.text?.message || body.message || 'Media/Unsupported Type';
    const externalId = body.zaapId || body.messageId;

    if (!senderPhone || !messageBody) return;

    // 3. Find or Create Contact via ContactsService to handle avatar and names
    const dbContact = await this.contactsService.findOrCreate(
      workspaceId,
      senderPhone,
      senderName,
      avatarUrl,
    );

    // 4. Find/Create Conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        workspaceId,
        contactId: dbContact.id,
        status: 'OPEN',
      },
      include: { contact: true, sector: true },
    });

    if (!conversation) {
      conversation = await this.conversationsService.create(workspaceId, {
        contactId: dbContact.id,
        channelId: channel.id,
        messageBody,
        contactPhone: senderPhone,
      });
    }

    // Session tracking
    await this.sessionService.trackClientMessage(conversation.id);

    // 5. Create Message
    const newMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageBody,
        type: (body.type || 'text').toUpperCase(),
        status: 'RECEIVED',
        fromAgent: false,
        externalId,
      },
    });

    const socketMessage = {
      ...newMessage,
      text:
        typeof newMessage.content === 'string'
          ? newMessage.content
          : (newMessage.content as any)?.text || '',
    };

    // 6. Emit socket event
    if (conversation.sectorId) {
      this.gateway.emitToSector(
        workspaceId,
        conversation.sectorId,
        'newMessage',
        {
          conversationId: conversation.id,
          channelType: 'WHATSAPP',
          message: socketMessage,
        },
      );
    } else {
      this.gateway.emitToWorkspace(workspaceId, 'newMessage', {
        conversationId: conversation.id,
        channelType: 'WHATSAPP',
        message: socketMessage,
      });
    }
  }
}
