import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ContactsService } from '../contacts/contacts.service';
import { SessionService } from '../performance/session.service';
import { AppGateway } from '../gateway/app.gateway';
import { KeywordDetectorService } from '../pipelines/keyword-detector.service';
import { UploadsService } from '../uploads/uploads.service';
import axios from 'axios';


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
  ) { }

  verifyWhatsapp(mode: string, token: string): boolean {
    // Simplified check. Real world: fetch config from DB.
    return mode === 'subscribe' && token === 'northway_omni_token';
  }

  async findChannelByPhoneId(phoneNumberId: string) {
    return this.prisma.channel.findFirst({
      where: { phoneNumberId },
    });
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

    // Detect keywords for automatic pipeline movement
    await this.keywordDetector.detect(
      messageBody,
      conversation.id,
      workspaceId,
      conversation.sectorId,
    );

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

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    // Strip +, @lid, @s.whatsapp.net, etc.
    return phone.replace(/^\+/, '').split('@')[0];
  }

  async processZapiMessage(instanceId: string, body: any) {
    try {
      // 0. Filter non-message events
      const eventType = (body.type || '').toLowerCase();
      const ignoredTypes = ['messagestatuscallback', 'messagestatusreceived', 'disconnected', 'connected', 'status-instance'];

      if (ignoredTypes.includes(eventType)) {
        console.log(`[Z-API Webhook] Skipping non-message event type: ${eventType}`);
        return;
      }

      console.log(`[Z-API Webhook] START processing for instance ${instanceId} (Type: ${eventType})`);

      // 1. Find Workspace by Instance ID
      const channels = await this.prisma.channel.findMany({
        where: { type: 'WHATSAPP' },
      });

      console.log(`[Z-API Webhook] Found ${channels.length} WHATSAPP channels in DB`);

      const channel = channels.find((c: any) => {
        const config = c.config as any;
        // Support both string and object if necessary
        const cInstanceId = typeof config === 'string' ? JSON.parse(config).instanceId : config?.instanceId;
        return cInstanceId === instanceId;
      });

      if (!channel) {
        console.error(`[Z-API Webhook] ERROR: No channel found for instanceId: ${instanceId}`);
        // Log available instanceIds for debugging
        channels.forEach(ch => {
          const cfg = ch.config as any;
          console.log(`- Available ID: ${ch.id}, InstanceId: ${cfg?.instanceId}`);
        });
        return;
      }

      const workspaceId = channel.workspaceId;
      console.log(`[Z-API Webhook] Matched Workspace: ${workspaceId}`);

      // 2. Extract Data
      const isFromMe = body.fromMe === true;
      const rawPhone = body.phone;
      const senderPhone = this.normalizePhone(rawPhone);
      const senderName = body.senderName || senderPhone;
      let avatarUrl = body.photo;
      const externalId = body.zaapId || body.messageId;

      // Map Z-API media fields
      let messageBody = body.text?.message || body.message || body.caption || '';
      const mediaType = (body.type || 'text').toLowerCase();
      // Expanded media mapping
      let mediaUrl = body.audio || body.image || body.video || body.document || body.thumbnailUrl || body.url || body.link;

      // Use descriptive placeholder if body is empty (non-text messages)
      if (!messageBody) {
        if (mediaType === 'audio' || mediaType === 'ptt') messageBody = 'Áudio';
        else if (mediaType === 'image') messageBody = 'Imagem';
        else if (mediaType === 'video') messageBody = 'Vídeo';
        else if (mediaType === 'document') messageBody = body.fileName || 'Arquivo';
        else if (mediaType === 'location') messageBody = 'Localização';
        else if (mediaType === 'contact') messageBody = 'Contato';
        else if (mediaType === 'sticker') messageBody = 'Figurinha';
        else messageBody = 'Media/Unsupported Type';
      }

      console.log(`[Z-API Webhook] Event Data: RawPhone=${rawPhone}, CleanPhone=${senderPhone}, Type=${mediaType}, Body=${messageBody.substring(0, 50)}`);

      if (!senderPhone || (!messageBody && !body.type)) {
        console.warn('[Z-API Webhook] WARNING: Missing phone or message content, skipping.');
        return;
      }

      // 2.1 Persist profile photo if provided (URLs expire)
      if (avatarUrl && avatarUrl.startsWith('http')) {
        try {
          const response = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 5000 });
          const buffer = Buffer.from(response.data, 'binary');
          const mimeType = response.headers['content-type'] || 'image/jpeg';

          const uploadResult = await this.uploadsService.uploadFromBuffer(
            buffer,
            `avatar-${senderPhone}.jpg`,
            mimeType,
            workspaceId,
            'SYSTEM',
          );
          avatarUrl = uploadResult.url;
          console.log(`[Z-API Webhook] Avatar persisted: ${avatarUrl}`);
        } catch (err) {
          console.error('[Z-API Webhook] Photo persistence failed:', err.message);
        }
      }

      // 3. Find or Create Contact
      const dbContact = await this.contactsService.findOrCreate(
        workspaceId,
        senderPhone,
        senderName,
        avatarUrl,
      );
      console.log(`[Z-API Webhook] Success: Found/Created Contact ${dbContact.id} for "${messageBody.substring(0, 20)}"`);

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
        console.log(`[Z-API Webhook] Creating NEW conversation for ${senderPhone} - "${messageBody.substring(0, 20)}"`);
        conversation = await this.conversationsService.create(workspaceId, {
          contactId: dbContact.id,
          channelId: channel.id,
          messageBody,
          contactPhone: senderPhone,
        });
      }

      console.log(`[Z-API Webhook] Using Conversation ${conversation.id} for "${messageBody.substring(0, 20)}"`);

      // Session tracking
      await this.sessionService.trackClientMessage(conversation.id).catch(e => console.error(`[Z-API Webhook] Session track failed for "${messageBody.substring(0, 20)}":`, e.message));

      // 5. Create Message (with duplicate protection and media support)
      let newMessage;
      const existingMessage = externalId ? await this.prisma.message.findFirst({ where: { externalId } }) : null;

      if (existingMessage) {
        console.warn(`[Z-API Webhook] Message ${externalId} already exists, skipping creation for "${messageBody.substring(0, 20)}"`);
        newMessage = existingMessage;
      } else {
        const messageContent: any = { text: messageBody };
        if (mediaUrl) {
          messageContent.mediaUrl = mediaUrl;
          messageContent.mediaType = mediaType === 'ptt' ? 'audio' : mediaType;
          if (mediaType === 'ptt') messageContent.isPtt = true;
          if (body.duration) messageContent.duration = body.duration;
        }

        newMessage = await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: messageContent,
            type: mediaType.toUpperCase(),
            status: isFromMe ? 'SENT' : 'RECEIVED',
            fromAgent: isFromMe,
            externalId,
          },
        });
        console.log(`[Z-API Webhook] SUCCESS: Message ${newMessage.id} stored for "${messageBody.substring(0, 20)}"`);
      }

      // Detect keywords
      await this.keywordDetector.detect(
        messageBody,
        conversation.id,
        workspaceId,
        conversation.sectorId,
      ).catch(e => console.error(`[Z-API Webhook] Keyword detection failed:`, e.message));

      const socketMessage = {
        ...newMessage,
        text: messageBody,
        mediaUrl: (newMessage.content as any).mediaUrl,
        mediaType: (newMessage.content as any).mediaType,
        isPtt: (newMessage.content as any).isPtt,
        duration: (newMessage.content as any).duration,
      };

      // 6. Emit socket event
      try {
        const emitPayload = {
          conversationId: conversation.id,
          channelType: 'WHATSAPP',
          message: socketMessage,
          contact: dbContact, // Include contact to help frontend
        };

        if (conversation.sectorId) {
          this.gateway.emitToSector(workspaceId, conversation.sectorId, 'newMessage', emitPayload);
        } else {
          this.gateway.emitToWorkspace(workspaceId, 'newMessage', emitPayload);
        }
        console.log(`[Z-API Webhook] Socket emitted for "${messageBody.substring(0, 20)}" in WS ${workspaceId}`);
      } catch (socketErr) {
        console.error(`[Z-API Webhook] Socket emission failed for "${messageBody.substring(0, 20)}":`, socketErr.message);
      }

    } catch (error) {
      console.error(`[Z-API Webhook] CRITICAL ERROR for "${body?.text?.message || 'unknown'}":`, error);
    }
  }
}
