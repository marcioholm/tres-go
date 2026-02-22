import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import axios from 'axios';
import { decrypt } from '../utils/crypto.util';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);
    constructor(private prisma: PrismaService) { }

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
                const formattedArchived = archived.map(msg => ({
                    ...msg,
                    isArchived: true
                }));
                messages = [...messages, ...formattedArchived];
            } catch (e) {
                // Ignore if cursor not found in archive either
            }
        }

        return messages;
    }

    async create(workspaceId: string, data: SendMessageDto) {
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
                type: data.type || (dbContent.mediaUrl ? (dbContent.isPtt ? 'AUDIO' : 'DOCUMENT') : 'TEXT'),
                content: dbContent,
                fromAgent: true,
                status: 'PENDING'
            }
        });

        // 2. Emit to Gateway (TODO)
        // 3. Send to Channel (WA/Insta) via ChannelsService (Mocking execution)

        // Fetch Conversation to identify destination
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: { contact: true, channel: true }
        });

        if (conversation && conversation.channel) {
            try {
                // If Channel config is 'ZAPI' vs 'META_CLOUD'
                const channelProvider = conversation.channel.type || 'META_CLOUD';

                if (channelProvider === 'WHATSAPP') {
                    await this.sendViaWhatsappOfficial(conversation.channel, conversation.contact.phone || '', data, dbContent);
                } else if (channelProvider === 'INSTAGRAM' || channelProvider === 'MESSENGER') {
                    await this.sendViaMetaMessenger(conversation.channel, conversation.contact.externalId || '', data, dbContent);
                }

                // Update message immediately if fast execution OK
                await this.prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'DELIVERED' }
                });
            } catch (error) {
                this.logger.error(`Error sending message down channel`, error);
                await this.prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'FAILED' }
                });
            }
        }

        return message;
    }

    // Método sendViaWhatsappOfficial — tratar áudio PTT:
    private async sendViaWhatsappOfficial(channel: any, to: string, dto: SendMessageDto, dbContent: any): Promise<string | undefined> {
        const url = `https://graph.facebook.com/v19.0/${channel.phoneNumberId || process.env.META_PHONE_NUMBER_ID}/messages`;
        const token = channel.accessToken ? decrypt(channel.accessToken) : process.env.META_SYSTEM_USER_TOKEN;
        const headers = { Authorization: `Bearer ${token}` };

        let body: any = {
            messaging_product: 'whatsapp',
            to,
            recipient_type: 'individual',
        };

        if (dbContent.isPtt || dto.type === 'AUDIO') {
            body.type = 'audio';
            body.audio = {
                link: dbContent.mediaUrl,
                ptt: !!dbContent.isPtt,
            };
        } else if (dto.type === 'IMAGE' || dto.type === 'VIDEO' || dto.type === 'DOCUMENT') {
            const type = dto.type.toLowerCase();
            body.type = type;
            body[type] = {
                link: dbContent.mediaUrl,
                caption: dbContent.body
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
            this.logger.error(`Failed to send message via Meta API`, error.response?.data || error.message);
            throw error;
        }
    }

    private async sendViaMetaMessenger(channel: any, recipientId: string, dto: SendMessageDto, dbContent: any): Promise<string | undefined> {
        try {
            console.log(`[Messages Service] Sending via Meta Messenger/Instagram. Channel: ${channel.name} (${channel.type}), Recipient: ${recipientId}`);

            const encryptedToken = channel.accessToken;
            const token = encryptedToken ? decrypt(encryptedToken) : process.env.META_SYSTEM_USER_TOKEN;

            if (!token) {
                this.logger.error('[Messages Service] Meta token not found or decryption failed');
                throw new Error('Access token not found');
            }

            const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`;
            const body: any = {
                recipient: { id: recipientId },
                message: {},
                messaging_type: 'RESPONSE'
            };

            if (dto.type === 'IMAGE' || dto.type === 'VIDEO' || dto.type === 'DOCUMENT' || dto.type === 'AUDIO') {
                body.message.attachment = {
                    type: dto.type.toLowerCase(),
                    payload: {
                        url: dbContent.mediaUrl,
                        is_selectable: true
                    }
                };
            } else {
                body.message.text = dbContent.body || dto.text || '';
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`[Messages Service] Meta API Error Details:`, JSON.stringify(data));
                throw new Error(data.error?.message || 'Failed to send message via Meta API');
            }

            console.log(`[Messages Service] Meta API Success:`, JSON.stringify(data));
            return data.message_id;
        } catch (error) {
            console.error(`[Messages Service] CRITICAL Error sending via Meta Messenger:`, error.message);
            throw error;
        }
    }

    // Método sendViaZapi — usar endpoint correto para PTT:
    private async sendViaZapi(channel: any, to: string, dto: SendMessageDto, dbContent: any): Promise<string | undefined> {
        const config = (channel.config as any) || {};
        const base = `https://api.z-api.io/instances/${config.instanceId}/token/${config.instanceToken}`;
        const headers = { 'Client-Token': config.clientToken };
        const phone = to.replace(/\D/g, '');

        let endpoint = '/send-text';
        let body: any = { phone };

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
        } else if (dto.type === 'DOCUMENT') {
            endpoint = '/send-document';
            body.document = dbContent.mediaUrl;
            body.fileName = dto.filename || 'document.pdf';
        } else {
            body.message = dbContent.body || dto.text || '';
        }

        try {
            this.logger.log(`[Z-API API] Sending Message to ${phone} via ${endpoint}...`);
            const res = await axios.post(`${base}${endpoint}`, body, { headers });
            return res.data?.zaapId || res.data?.messageId;
        } catch (error) {
            this.logger.error(`Failed to send message via Z-API`, error.response?.data || error.message);
            throw error;
        }
    }
}
