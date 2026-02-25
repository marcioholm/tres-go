import { Injectable, Logger } from '@nestjs/common';
import { MessageType, MessageProvider } from '@prisma/client';

export interface NormalizedIncomingMessage {
    provider: MessageProvider;
    channelKey: string; // zapiInstanceId ou phoneNumberId
    providerMessageId: string;
    providerTimestamp?: Date;
    fromMe: boolean;
    contact: {
        phone: string;
        name?: string;
    };
    type: MessageType;
    text?: string;
    media?: {
        url: string;
        mimeType?: string;
        fileName?: string;
        size?: number;
        isVoiceNote?: boolean;
        caption?: string;
    };
    reaction?: {
        emoji: string;
        targetProviderMessageId: string;
    };
    rawPayload: any;
    statusUpdate?: {
        messageId: string;
        status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    };
}

@Injectable()
export class MessageIngestService {
    private readonly logger = new Logger(MessageIngestService.name);

    normalizeZapi(instanceId: string, payload: any): NormalizedIncomingMessage | null {
        // Z-API status update handling
        if (payload.status && (payload.messageId || payload.zaapId)) {
            const status = payload.status.toUpperCase();
            const allowedStatuses = ['SENT', 'DELIVERED', 'READ', 'FAILED'];
            if (allowedStatuses.includes(status)) {
                return {
                    provider: MessageProvider.ZAPI,
                    channelKey: instanceId,
                    providerMessageId: payload.messageId || payload.zaapId,
                    fromMe: true,
                    contact: { phone: payload.phone || '' },
                    type: MessageType.TEXT,
                    rawPayload: payload,
                    statusUpdate: {
                        messageId: payload.messageId || payload.zaapId,
                        status: status as any
                    }
                };
            }
        }

        // 0. Filtrar eventos que não são de mensagem
        const typeStr = (payload.type || '').toLowerCase();

        // Z-API envia diversos tipos de eventos. Focamos nos de mensagem.
        if (!payload.phone || (!payload.zaapId && !payload.messageId)) {
            return null;
        }

        const providerMessageId = payload.zaapId || payload.messageId;
        const phone = this.cleanPhone(payload.phone);

        let type: MessageType = MessageType.TEXT;
        let text = payload.text?.message || payload.message || payload.caption || (typeof payload.text === 'string' ? payload.text : '') || '';

        // Normalização de URL de mídia (Correção do erro [object Object])
        const rawMediaUrl = payload.audio || payload.image || payload.video || payload.document ||
            payload.sticker || payload.thumbnailUrl || payload.url || payload.link || payload.file;

        let mediaUrl: string | undefined;
        if (typeof rawMediaUrl === 'object' && rawMediaUrl !== null) {
            mediaUrl = rawMediaUrl.url || rawMediaUrl.link || rawMediaUrl.file || rawMediaUrl.thumbnailUrl ||
                rawMediaUrl.stickerUrl || rawMediaUrl.audioUrl || rawMediaUrl.videoUrl || rawMediaUrl.imageUrl;
            if (!mediaUrl) {
                this.logger.warn(`[ZAPI] Media object detected but no URL found: ${JSON.stringify(rawMediaUrl)}`);
            } else {
                this.logger.debug(`[ZAPI] Extracted URL from object for ${providerMessageId}: ${mediaUrl}`);
            }
        } else if (typeof rawMediaUrl === 'string' && rawMediaUrl.startsWith('http')) {
            mediaUrl = rawMediaUrl;
        } else if (payload.data && typeof payload.data === 'string' && payload.data.startsWith('http')) {
            mediaUrl = payload.data; // Z-API sometime uses .data for URLs
        }

        // Mapeamento de tipo
        const zType = payload.type?.toLowerCase();
        const hasStickerUrl = !!(payload.stickerUrl || (typeof payload.data === 'object' && payload.data?.stickerUrl));

        if (zType === 'audio' || zType === 'ptt') type = MessageType.AUDIO;
        else if (zType === 'image') type = MessageType.IMAGE;
        else if (zType === 'video') type = MessageType.VIDEO;
        else if (zType === 'sticker' || hasStickerUrl) type = MessageType.STICKER;
        else if (zType === 'document' || zType === 'file') type = MessageType.DOCUMENT;
        else if (zType === 'location') type = MessageType.LOCATION;
        else if (zType === 'contact') type = MessageType.CONTACT;
        else if (payload.audio) type = MessageType.AUDIO;
        else if (payload.image) type = MessageType.IMAGE;
        else if (payload.sticker) type = MessageType.STICKER;

        // Reações
        let reaction;
        if (payload.reaction) {
            type = MessageType.REACTION;
            reaction = {
                emoji: payload.reaction.text || payload.reaction.emoji,
                targetProviderMessageId: payload.reaction.messageId
            };
        }

        return {
            provider: MessageProvider.ZAPI,
            channelKey: instanceId,
            providerMessageId,
            providerTimestamp: payload.timestamp ? new Date(payload.timestamp * 1000) : new Date(),
            fromMe: payload.fromMe === true,
            contact: {
                phone,
                name: payload.senderName || phone,
            },
            type,
            text: text || '',
            media: mediaUrl ? {
                url: mediaUrl,
                fileName: payload.fileName,
                isVoiceNote: !!payload.isPtt || zType === 'ptt' || type === MessageType.AUDIO,
                caption: payload.caption
            } : undefined,
            reaction,
            rawPayload: payload,
        };
    }

    normalizeWhatsappCloud(phoneNumberId: string, payload: any): NormalizedIncomingMessage | null {
        const value = payload.entry?.[0]?.changes?.[0]?.value;
        const message = value?.messages?.[0];
        const contact = value?.contacts?.[0];

        if (!message) return null;

        let type: MessageType = MessageType.TEXT;
        switch (message.type) {
            case 'image': type = MessageType.IMAGE; break;
            case 'video': type = MessageType.VIDEO; break;
            case 'audio': type = MessageType.AUDIO; break;
            case 'document': type = MessageType.DOCUMENT; break;
            case 'sticker': type = MessageType.STICKER; break;
            case 'reaction': type = MessageType.REACTION; break;
            case 'location': type = MessageType.LOCATION; break;
            case 'contacts': type = MessageType.CONTACT; break;
            default: type = MessageType.TEXT;
        }

        const mediaData = message[message.type];

        return {
            provider: MessageProvider.WA_CLOUD,
            channelKey: phoneNumberId,
            providerMessageId: message.id,
            providerTimestamp: new Date(parseInt(message.timestamp) * 1000),
            fromMe: false,
            contact: {
                phone: message.from,
                name: contact?.profile?.name || message.from,
            },
            type,
            text: message.text?.body || mediaData?.caption || '',
            media: mediaData?.id ? {
                url: mediaData.id, // Store ID for download worker
                mimeType: mediaData.mime_type,
                fileName: mediaData.filename,
                isVoiceNote: message.type === 'audio' && mediaData.voice === true,
                caption: mediaData.caption
            } : undefined,
            reaction: type === MessageType.REACTION ? {
                emoji: message.reaction.emoji,
                targetProviderMessageId: message.reaction.message_id
            } : undefined,
            rawPayload: payload,
        };
    }

    private cleanPhone(phone: string): string {
        if (!phone) return '';
        return phone.replace(/^\+/, '').split('@')[0];
    }
}
