import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { AppGateway } from '../gateway/app.gateway';
import { SessionService } from '../performance/session.service';
import { decrypt } from '../utils/crypto.util';
import { UploadsService } from '../uploads/uploads.service';
import axios from 'axios';
import { normalizeMessageContent } from '../messages/utils/message-utils';
import { MessageType } from '@prisma/client';
import { KeywordDetectorService } from '../pipelines/keyword-detector.service';

@Injectable()
export class MetaWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly gateway: AppGateway,
    private readonly sessionService: SessionService,
    private readonly uploadsService: UploadsService,
    private readonly keywordDetector: KeywordDetectorService,
  ) { }

  validateSignature(rawBody: Buffer, signature: string): boolean {
    if (!signature) return false;

    const expected = crypto
      .createHmac('sha256', process.env.META_APP_SECRET || '')
      .update(rawBody)
      .digest('hex');

    const actual = signature.startsWith('sha256=')
      ? signature.split('=')[1]
      : signature;

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(actual, 'hex'),
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
        const messaging =
          entry.messaging || entry.changes?.[0]?.value?.messages || [];

        for (const event of messaging) {
          // 1. Tentar encontrar o canal específico pelo recipient.id (mais preciso para distinguir IG de Messenger)
          const recipientId = event.recipient?.id;
          let channel = null;

          if (recipientId) {
            channel = await this.prisma.channel.findFirst({
              where: {
                OR: [
                  { pageId: recipientId, status: 'ACTIVE' },
                  { igAccountId: recipientId, status: 'ACTIVE' },
                ],
              },
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
            console.log(
              `[Meta Webhook] No active channel found for entry: ${entryId}, recipient: ${recipientId}`,
            );
            continue;
          }

          console.log(
            `[Meta Webhook] Processing event for channel: ${channel.name} (${channel.id})`,
          );

          if (event.message) {
            if (event.message.is_echo) {
              // Message sent by the page itself (from phone/desktop IG)
              await this.handleEchoMessage(channel, event);
            } else {
              await this.handleIncomingMessage(channel, event);
            }
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
                where: { pageId: entryId, type: 'WHATSAPP', status: 'ACTIVE' },
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
    let avatarUrl = undefined;
    let handle = undefined;

    try {
      if (channel.type === 'INSTAGRAM' || channel.type === 'MESSENGER') {
        const encryptedToken = channel.accessToken;
        const token = encryptedToken
          ? decrypt(encryptedToken)
          : process.env.META_SYSTEM_USER_TOKEN;

        const fields =
          channel.type === 'INSTAGRAM'
            ? 'name,username,profile_pic,profile_picture_url'
            : 'name,profile_pic';
        const profileRes = await fetch(
          `https://graph.facebook.com/v21.0/${senderId}?fields=${fields}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const profileData = await profileRes.json();
        console.log(
          '[Meta Webhook] Raw profile data:',
          JSON.stringify(profileData),
        );

        if (profileData.name) profileName = profileData.name;
        // Try both profile_pic and profile_picture_url (varies by API version)
        if (profileData.profile_pic || profileData.profile_picture_url) {
          avatarUrl =
            profileData.profile_pic || profileData.profile_picture_url;
        }
        if (profileData.username) handle = profileData.username;

        console.log(`[Meta Webhook] Profile Fetch Result:`, {
          profileName,
          avatarUrl,
          handle,
        });
      }
    } catch (error) {
      // Ignored
    }

    // Buscar ou criar contato (usando o perfil se encontrado)
    console.log(
      `[Meta Webhook] Identifying contact for Workspace: ${channel.workspaceId}, Identifier: ${senderId}, Name: ${profileName || 'Unknown'}, Handle: ${handle || 'N/A'}`,
    );
    const contact = await this.contactsService.findOrCreate(
      channel.workspaceId,
      senderId,
      profileName,
      avatarUrl,
      handle,
    );
    console.log(
      `[Meta Webhook] Contact identified: ${contact.id} (${contact.name}) @${(contact as any).handle}`,
    );

    // Buscar ou criar conversa
    const conversation = await this.conversationsService.findOrCreate(
      channel.workspaceId,
      channel.id,
      contact.id,
    );

    await this.sessionService.trackClientMessage(conversation.id);

    // Salvar mensagem
    const messageContent = text; // User requested normalization to string for simple text

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        providerMessageId: mid,
        fromAgent: false,
        type: attachments.length > 0 ? MessageType.DOCUMENT : MessageType.TEXT,
        content: normalizeMessageContent(
          attachments.length > 0
            ? {
              text: text,
              attachments: attachments.map((a: any) => ({
                type: a.type,
                url: a.payload?.url,
              })),
            }
            : text
        ),
        status: 'SENT',
        createdAt: new Date(event.timestamp),
      },
    });
    console.log(`[Meta Webhook] SUCCESS: Message created. ID=${message.id}, ExtID=${mid}, Workspace=${channel.workspaceId}, Contact=${contact.id}, Provider=${channel.type}`);

    // 5. Persistir mídia se houver anexos
    if (attachments.length > 0) {
      this.persistMetaMedia(channel, message.id, attachments).catch(e =>
        console.error('[Meta Webhook] Error persisting media:', e)
      );
    }

    // Emit socket event via Gateway
    const socketMessage = {
      ...message,
      text:
        typeof message.content === 'string'
          ? message.content
          : (message.content as any)?.text || '',
    };

    this.gateway.emitToWorkspace(channel.workspaceId, 'newMessage', {
      conversationId: conversation.id,
      channelType: channel.type, // 'INSTAGRAM' | 'MESSENGER' | 'WHATSAPP'
      message: socketMessage,
      contact: {
        id: contact.id,
        name: (contact as any).handle
          ? `@${(contact as any).handle}`
          : contact.name,
        avatarUrl: (contact as any).avatarUrl || null,
        handle: (contact as any).handle || null,
      },
    });

    // Detecção de gatilhos de funil (Palavras-chave)
    if (message.type === 'TEXT' || (message.content as any)?.text) {
      this.keywordDetector.detect(
        (message.content as any)?.text || '',
        conversation.id,
        channel.workspaceId,
        conversation.sectorId || undefined
      ).catch(err => console.error('[Meta Webhook] Keyword detection error:', err));
    }

    console.log('Mensagem salva e emitida:', message.id);
  }

  // Mensagem enviada a partir do celular/IG pela própria página: registrar como fromAgent
  private async handleEchoMessage(channel: any, event: any) {
    // On echo: sender = page, recipient = user
    const recipientId = event.recipient?.id;
    const text = event.message?.text || '';
    const mid = event.message?.mid;

    if (!recipientId) return;

    console.log(
      `[Meta Webhook] Echo message detected (sent from phone/page). Recipient: ${recipientId}`,
    );

    // Try to fetch recipient profile too
    let profileName: string | undefined;
    let avatarUrl: string | undefined;
    let handle: string | undefined;
    try {
      const encryptedToken = channel.accessToken;
      const token = encryptedToken
        ? decrypt(encryptedToken)
        : process.env.META_SYSTEM_USER_TOKEN;
      const fields =
        channel.type === 'INSTAGRAM'
          ? 'name,username,profile_pic'
          : 'name,profile_pic';
      const profileRes = await fetch(
        `https://graph.facebook.com/v21.0/${recipientId}?fields=${fields}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const profileData = await profileRes.json();
      console.log(
        '[Meta Webhook] Echo recipient profile:',
        JSON.stringify(profileData),
      );
      if (profileData.name) profileName = profileData.name;
      if (profileData.profile_pic || profileData.profile_picture_url) {
        avatarUrl = profileData.profile_pic || profileData.profile_picture_url;
      }
      if (profileData.username) handle = profileData.username;
    } catch (e) {
      console.error('[Meta Webhook] Echo profile fetch error:', e.message);
    }

    // Find or create contact with fetched profile data
    const contact = await this.contactsService.findOrCreate(
      channel.workspaceId,
      recipientId,
      profileName,
      avatarUrl,
      handle,
    );

    // Find or create conversation
    const conversation = await this.conversationsService.findOrCreate(
      channel.workspaceId,
      channel.id,
      contact.id,
    );

    // Save message as fromAgent = true (sent by the agent from phone)
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        providerMessageId: mid,
        fromAgent: true,
        senderName: 'Celular',
        type: 'TEXT',
        content: normalizeMessageContent(text),
        status: 'DELIVERED',
        createdAt: new Date(event.timestamp), // timestamp já vem em ms para IG/Messenger
      },
    });

    // Emit socket event so the UI updates in real time
    this.gateway.emitToWorkspace(channel.workspaceId, 'newMessage', {
      conversationId: conversation.id,
      message: { ...message, text },
    });

    console.log('[Meta Webhook] Echo message saved as fromAgent:', message.id);
  }

  private async handleWhatsAppWebhook(channel: any, value: any) {
    const messages = value.messages || [];
    const contacts = value.contacts || [];

    for (const msg of messages) {
      const phone = msg.from;
      const waContact = contacts.find((c: any) => c.wa_id === phone);
      const senderName = waContact?.profile?.name || phone;

      const contact = await this.contactsService.findOrCreate(
        channel.workspaceId,
        phone,
        senderName,
      );
      const conversation = await this.conversationsService.findOrCreate(
        channel.workspaceId,
        channel.id,
        contact.id,
      );

      await this.sessionService.trackClientMessage(conversation.id);

      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          providerMessageId: msg.id,
          fromAgent: false,
          type: (msg.type || 'TEXT').toUpperCase(),
          content: normalizeMessageContent({
            text: msg.text?.body || msg.caption || '',
            mediaType: msg.type
          }),
          status: 'SENT',
          createdAt: new Date(parseInt(msg.timestamp) * 1000),
        },
      });

      // Persistir mídia WhatsApp
      const hasMedia = ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER'].includes(message.type);
      if (hasMedia) {
        const mediaId = msg[msg.type.toLowerCase()]?.id;
        if (mediaId) {
          this.persistWhatsAppMedia(channel, message.id, mediaId, msg.type).catch(e =>
            console.error('[Meta Webhook] Error persisting WA media:', e)
          );
        }
      }

      this.gateway.emitToWorkspace(channel.workspaceId, 'newMessage', {
        conversationId: conversation.id,
        message: {
          ...message,
          text:
            typeof message.content === 'string'
              ? message.content
              : (message.content as any)?.text || '',
        },
      });

      // Detecção de gatilhos de funil (Palavras-chave)
      if (message.type === 'TEXT' || (message.content as any)?.text) {
        this.keywordDetector.detect(
          (message.content as any)?.text || '',
          conversation.id,
          channel.workspaceId,
          conversation.sectorId || undefined
        ).catch(err => console.error('[Meta Webhook] Keyword detection error:', err));
      }
    }
  }

  private async handleMessageRead(channel: any, event: any) {
    if (event.read?.watermark) {
      const watermarkDate = new Date(parseInt(event.read.watermark));
      const updated = await this.prisma.message.findMany({
        where: {
          conversation: { channelId: channel.id },
          fromAgent: true,
          status: { not: 'READ' },
          createdAt: { lte: watermarkDate },
        }
      });

      await this.prisma.message.updateMany({
        where: { id: { in: updated.map(m => m.id) } },
        data: { status: 'READ' },
      });

      for (const m of updated) {
        this.gateway.emitToWorkspace(channel.workspaceId, 'messageStatusUpdate', {
          messageId: m.id,
          conversationId: m.conversationId,
          status: 'READ',
        });
      }
    } else if (event.read?.mid) {
      const message = await this.prisma.message.findFirst({
        where: {
          conversation: { channelId: channel.id },
          providerMessageId: event.read.mid,
        },
      });

      if (message) {
        await this.prisma.message.update({
          where: { id: message.id },
          data: { status: 'READ' },
        });

        this.gateway.emitToWorkspace(channel.workspaceId, 'messageStatusUpdate', {
          messageId: message.id,
          conversationId: message.conversationId,
          status: 'READ',
        });
      }
    }
  }

  private async handleMessageDelivery(channel: any, event: any) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversation: { channelId: channel.id },
        providerMessageId: { in: event.delivery?.mids || [] },
      },
    });

    await this.prisma.message.updateMany({
      where: { id: { in: messages.map(m => m.id) } },
      data: { status: 'DELIVERED' },
    });

    for (const m of messages) {
      this.gateway.emitToWorkspace(channel.workspaceId, 'messageStatusUpdate', {
        messageId: m.id,
        conversationId: m.conversationId,
        status: 'DELIVERED',
      });
    }
  }

  private async persistMetaMedia(channel: any, messageId: string, attachments: any[]) {
    const encryptedToken = channel.accessToken;
    const token = encryptedToken ? decrypt(encryptedToken) : process.env.META_SYSTEM_USER_TOKEN;
    if (!token) return;

    for (const attachment of attachments) {
      if (!attachment.payload?.url) continue;

      try {
        console.log(`[Meta Webhook] Persisting Meta media for msg ${messageId}: ${attachment.payload.url}`);
        const response = await axios.get(attachment.payload.url, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${token}` }
        });

        const buffer = Buffer.from(response.data, 'binary');
        const mimeType = response.headers['content-type'] || 'application/octet-stream';
        const filename = `meta-${Date.now()}`;

        const upload = await this.uploadsService.uploadFromBuffer(
          buffer,
          filename,
          mimeType,
          channel.workspaceId,
          'SYSTEM'
        );

        const currentMsg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!currentMsg) continue;

        const currentContent = typeof currentMsg.content === 'object' ? currentMsg.content as any : { text: String(currentMsg.content) };

        await this.prisma.message.update({
          where: { id: messageId },
          data: {
            content: normalizeMessageContent({
              ...currentContent,
              mediaUrl: upload.url,
              mimeType: mimeType,
              kind: attachment.type || currentContent.kind
            })
          }
        });
        console.log(`[Meta Webhook] Meta media persisted successfuly: ${upload.url}`);
      } catch (e) {
        console.error(`[Meta Webhook] Failed to persist attachment:`, e.message);
      }
    }
  }

  private async persistWhatsAppMedia(channel: any, messageId: string, mediaId: string, type: string) {
    const token = channel.accessToken ? decrypt(channel.accessToken) : process.env.META_SYSTEM_USER_TOKEN;
    if (!token) return;

    try {
      // 1. Get media URL
      const metaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
      console.log(`[Meta Webhook] Fetching WA media metadata: ${metaUrl}`);
      const metadataRes = await axios.get(metaUrl, { headers: { Authorization: `Bearer ${token}` } });
      const downloadUrl = metadataRes.data.url;

      if (!downloadUrl) {
        console.warn(`[Meta Webhook] No download URL found for WA media ${mediaId}`);
        return;
      }

      // 2. Download content
      console.log(`[Meta Webhook] Downloading WA media from: ${downloadUrl}`);
      const mediaRes = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Save to local storage
      const buffer = Buffer.from(mediaRes.data, 'binary');
      const mimeType = mediaRes.headers['content-type'] || 'image/jpeg';
      const filename = `wa-${type.toLowerCase()}-${Date.now()}`;
      const upload = await this.uploadsService.uploadFromBuffer(
        buffer,
        filename,
        mimeType,
        channel.workspaceId,
        'SYSTEM',
        { asPtt: type === 'AUDIO' }
      );

      // 4. Update message content
      const currentMsg = await this.prisma.message.findUnique({ where: { id: messageId } });
      if (!currentMsg) return;

      const currentContent = typeof currentMsg.content === 'object' ? currentMsg.content as any : { text: String(currentMsg.content) };

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: normalizeMessageContent({
            ...currentContent,
            mediaUrl: upload.url,
            mediaType: type.toLowerCase(),
            mimeType: mimeType
          })
        }
      });
      console.log(`[Meta Webhook] WA media persisted successfuly: ${upload.url}`);
    } catch (e) {
      console.error(`[Meta Webhook] Failed to persist WA media ${mediaId}:`, e.message);
    }
  }
}
