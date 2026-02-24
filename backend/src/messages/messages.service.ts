import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import axios from 'axios';
import { decrypt } from '../utils/crypto.util';
import { SessionService } from '../performance/session.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService,
  ) { }

  async findAll(workspaceId: string, conversationId: string, cursor?: string) {
    let messages = [];
    let cursorError = false;

    try {
      messages = await this.prisma.message.findMany({
        where: { conversationId, conversation: { workspaceId } }, // Ensure workspace ownership
        take: 20,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      // Prisma throws if cursor is not found. It means cursor is likely in ArchivedMessage.
      cursorError = true;
    }

    if (messages.length < 20) {
      const takeRemaining = 20 - messages.length;

      let cursorForArchive = undefined;
      if (cursor && (cursorError || messages.length === 0)) {
        cursorForArchive = { id: cursor };
      }

      try {
        const archived = await this.prisma.archivedMessage.findMany({
          where: { conversationId, conversation: { workspaceId } },
          take: takeRemaining,
          skip: cursorForArchive ? 1 : 0,
          cursor: cursorForArchive,
          orderBy: { createdAt: 'desc' },
        });
        // Map archivedMessage to standard message format so frontend doesn't break
        const formattedArchived = archived.map((msg) => ({
          ...msg,
          isArchived: true,
        }));
        messages = [...messages, ...formattedArchived];
      } catch (e) {
        // Ignore if cursor not found in archive either
      }
    }

    return messages;
  }

  async create(
    workspaceId: string,
    data: SendMessageDto,
    senderName?: string,
    agentId?: string,
  ) {
    // Prepare content structure
    const contentPayload = data.text ? data.text : undefined;
    let dbContent: any = { body: contentPayload };

    // Se a chamada vier direta da API sem encapsulamento de `content`, reagrupamos os atributos.
    if ((data as any).content && typeof (data as any).content === 'object') {
      dbContent = (data as any).content;
    } else {
      dbContent.mediaUrl = data.mediaUrl;
      dbContent.mediaType = data.type?.toLowerCase();
      if (data.isPtt) {
        dbContent.isPtt = true;
        dbContent.duration = data.duration;
        dbContent.waveform = data.waveform;
      }
    }

    // 1. Save to DB
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        type:
          data.type ||
          (dbContent.mediaUrl
            ? dbContent.isPtt
              ? 'AUDIO'
              : (data.type || 'DOCUMENT')
            : 'TEXT'),
        content: dbContent,
        fromAgent: true,
        senderName,
        status: 'PENDING',
      },
    });

    this.logger.log(`Mensagem salva no DB: ${message.id} (Status: ${message.status})`);

    // 2. Emit to Gateway (TODO)
    // 3. Send to Channel (WA/Insta) via ChannelsService (Mocking execution)

    // Fetch Conversation to identify destination
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { contact: true, channel: true },
    });

    this.logger.log(`Enviando mensagem para conversa ${data.conversationId}. Canal habilitado: ${!!conversation?.channel}`);

    if (conversation && conversation.channel) {
      try {
        // Detect provider: Meta (Official) vs Z-API
        let channelProvider: string = conversation.channel.type;
        const config = (conversation.channel.config as any) || {};

        // Only use Z-API if it's a WHATSAPP channel with Z-API config OR if type is explicitly ZAPI
        if (
          (conversation.channel.type === 'WHATSAPP' && config.instanceId) ||
          (conversation.channel.type as string) === 'ZAPI'
        ) {
          channelProvider = 'ZAPI';
        }

        this.logger.log(`[MessagesService] Context: ${channelProvider}, Channel ID: ${conversation.channel.id}, Type: ${conversation.channel.type}`);
        this.logger.log(`[MessagesService] Contact Info: Name: ${conversation.contact.firstName}, Phone: ${conversation.contact.phone}, ExtID: ${conversation.contact.externalId}`);

        if (channelProvider === 'WHATSAPP') {
          // Official Meta WhatsApp
          await this.sendViaWhatsappOfficial(
            conversation.channel,
            conversation.contact.phone || '',
            data,
            dbContent,
          );
        } else if (channelProvider === 'ZAPI') {
          // Z-API WhatsApp
          await this.sendViaZapi(
            conversation.channel,
            conversation.contact.phone || '',
            data,
            dbContent,
          );
        } else if (
          channelProvider === 'INSTAGRAM' ||
          channelProvider === 'MESSENGER'
        ) {
          // Meta Messenger/Instagram (always official for now)
          await this.sendViaMetaMessenger(
            conversation.channel,
            conversation.contact.externalId || '',
            data,
            dbContent,
          );
        }

        // Update message immediately if fast execution OK
        await this.prisma.message.update({
          where: { id: message.id },
          data: { status: 'DELIVERED' },
        });
      } catch (error: any) {
        const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        this.logger.error(`Error sending message down channel: ${errorDetails}`);
        await this.prisma.message.update({
          where: { id: message.id },
          data: { status: 'FAILED' },
        });
      }
    }


    // Track session metrics
    if (agentId) {
      await this.sessionService.trackAgentMessage(data.conversationId, agentId);
    }

    return message;
  }

  // Método sendViaWhatsappOfficial — tratar áudio PTT:
  private async sendViaWhatsappOfficial(
    channel: any,
    to: string,
    dto: SendMessageDto,
    dbContent: any,
  ): Promise<string | undefined> {
    const phoneNumberId = channel.phoneNumberId || process.env.META_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
      throw new Error(`Canal ${channel.id} não tem phoneNumberId configurado`);
    }

    const token = channel.accessToken
      ? decrypt(channel.accessToken)
      : process.env.META_SYSTEM_USER_TOKEN;

    if (!token) {
      throw new Error(`Canal ${channel.id} não tem accessToken configurado`);
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const headers = { Authorization: `Bearer ${token}` };

    const body: any = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      recipient_type: 'individual',
    };

    if (dbContent.isPtt || dto.type === 'AUDIO') {
      body.type = 'audio';
      body.audio = {
        link: dbContent.mediaUrl,
        ptt: !!dbContent.isPtt,
      };
    } else if (
      dto.type === 'IMAGE' ||
      dto.type === 'VIDEO' ||
      dto.type === 'DOCUMENT'
    ) {
      const type = dto.type.toLowerCase();
      body.type = type;
      body[type] = {
        link: dbContent.mediaUrl,
        caption: dbContent.body,
      };
    } else {
      body.type = 'text';
      body.text = { body: dbContent.body || dto.text || '' };
    }

    try {
      this.logger.log(`[Official API] Sending Message to ${to}...`);
      const res = await axios.post(url, body, { headers });
      return res.data?.messages?.[0]?.id;
    } catch (error) {
      this.logger.error(
        `Failed to send message via Meta Meta WhatsApp API: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw error;
    }
  }

  private async sendViaMetaMessenger(
    channel: any,
    recipientId: string,
    dto: SendMessageDto,
    dbContent: any,
  ): Promise<string | undefined> {
    try {
      console.log('Enviando mensagem para Meta:', {
        recipientId,
        channelId: channel.id,
        channelType: channel.type,
      });

      const encryptedToken = channel.accessToken;
      const token = encryptedToken
        ? decrypt(encryptedToken)
        : process.env.META_SYSTEM_USER_TOKEN;

      console.log(
        `[Messages Service] Decrypted token length: ${token?.length}, Prefix: ${token?.substring(0, 5)}...`,
      );

      if (!token) {
        this.logger.error(
          '[Messages Service] Meta token not found or decryption failed',
        );
        throw new Error('Access token not found');
      }

      // Auto-detect token type and use correct endpoint:
      // EAA (Page/System User token) → Messenger Platform → /{pageId}/messages
      // IGAAX (Instagram User token) → Instagram Business API → /{igAccountId}/messages
      const isInstagram = channel.type === 'INSTAGRAM';
      const endpointId = isInstagram
        ? channel.igAccountId || channel.pageId || 'me'
        : channel.pageId || 'me';
      const url = `https://graph.facebook.com/v21.0/${endpointId}/messages`;

      console.log(
        `[Messages Service] Token type: ${token.startsWith('EAA') ? 'EAA/Page' : 'IGAAX/IG'}, Endpoint: ${endpointId}`,
      );
      console.log(`[Messages Service] URL: ${url}`);

      const body: any = {
        recipient: { id: recipientId },
        message: {},
      };

      if (
        dto.type === 'IMAGE' ||
        dto.type === 'VIDEO' ||
        dto.type === 'DOCUMENT' ||
        dto.type === 'AUDIO'
      ) {
        body.message.attachment = {
          type: dto.type.toLowerCase(),
          payload: {
            url: dbContent.mediaUrl,
            is_selectable: true,
          },
        };
      } else {
        body.message.text = dbContent.body || dto.text || '';
      }

      console.log('[Messages Service] Request Body:', JSON.stringify(body));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Resposta da Meta:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(
          `[Messages Service] Meta API Error Details:`,
          JSON.stringify(data),
        );
        throw new Error(
          data.error?.message || 'Failed to send message via Meta API',
        );
      }

      return data.message_id;
    } catch (error) {
      console.error(
        `[Messages Service] CRITICAL Error sending via Meta Messenger:`,
        error.message,
      );
      throw error;
    }
  }

  // Método sendViaZapi — usar endpoint correto para PTT:
  private async sendViaZapi(
    channel: any,
    to: string,
    dto: SendMessageDto,
    dbContent: any,
  ): Promise<string | undefined> {
    const config = channel.config || {};
    const base = `https://api.z-api.io/instances/${config.instanceId}/token/${config.instanceToken}`;
    const headers = { 'Client-Token': config.clientToken };
    const phone = to.replace(/\D/g, '');

    let endpoint = '/send-text';
    const body: any = { phone };

    if (dbContent.isPtt || dto.type === 'AUDIO') {
      const isVoiceNote = dbContent.isPtt !== false;
      endpoint = isVoiceNote ? '/send-audio' : '/send-file';
      if (isVoiceNote) {
        body.audio = dbContent.mediaUrl;
      } else {
        body.file = dbContent.mediaUrl;
        body.fileName = dto.filename || 'audio.mp3';
      }
    } else if (dto.type === 'IMAGE') {
      endpoint = '/send-image';
      body.image = dbContent.mediaUrl;
      body.caption = dbContent.body;
    } else if (dto.type === 'VIDEO') {
      endpoint = '/send-video';
      body.video = dbContent.mediaUrl;
    } else if (dto.type === 'STICKER') {
      endpoint = '/send-sticker';
      body.sticker = dbContent.mediaUrl;
    } else if (dto.type === 'DOCUMENT') {
      endpoint = '/send-document';
      body.document = dbContent.mediaUrl;
      body.fileName = dto.filename || 'document.pdf';
    } else {
      body.message = dbContent.body || dto.text || '';
    }

    try {
      this.logger.log(
        `[Z-API API] Sending Message to ${phone} via ${endpoint}...`,
      );
      const res = await axios.post(`${base}${endpoint}`, body, { headers });
      return res.data?.zaapId || res.data?.messageId;
    } catch (error) {
      this.logger.error(
        `Failed to send message via Z-API`,
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
