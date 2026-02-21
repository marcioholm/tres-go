import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import axios from 'axios';

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
                    // Try to send via Meta first, or Z-api if config says so (assuming we use WhatsApp for both)
                    await this.sendViaWhatsappOfficial(conversation.channel, conversation.contact.phone || '', data, dbContent);
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
    private async sendViaWhatsappOfficial(config: any, to: string, dto: SendMessageDto, dbContent: any): Promise<string | undefined> {
        const url = `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`;
        const headers = { Authorization: `Bearer ${config.accessToken}` };

        if (dbContent.isPtt) {
            const body = {
                messaging_product: 'whatsapp',
                to,
                recipient_type: 'individual',
                type: 'audio',
                audio: {
                    link: dbContent.mediaUrl,
                    ptt: true,
                },
            };
            this.logger.log(`[Official API] Sending PTT Message to ${to}...`);
            // MOCKED HTTP execution (replace with actual when doing real WA)
            // const res = await axios.post(url, body, { headers });
            // return res.data?.messages?.[0]?.id;
            return "mock-official-message-id";
        }

        if (dto.type === 'AUDIO') {
            this.logger.log(`[Official API] Sending Normal Audio File to ${to}...`);
            return "mock-normalaudio-id";
        }

        // ... resto do método para outros tipos ...
        return "mock-other-message-id";
    }

    // Método sendViaZapi — usar endpoint correto para PTT:
    private async sendViaZapi(config: any, to: string, dto: SendMessageDto, dbContent: any): Promise<string | undefined> {
        const base = `https://api.z-api.io/instances/${config.instanceId}/token/${config.instanceToken}`;
        const headers = { 'Client-Token': config.clientToken };
        const phone = to.replace(/\D/g, '');

        if (dbContent.isPtt || dto.type === 'AUDIO') {
            // Z-API: /send-audio → PTT (mensagem de voz)
            // Z-API: /send-file  → arquivo de áudio comum
            const isVoiceNote = dbContent.isPtt !== false;
            const endpoint = isVoiceNote ? '/send-audio' : '/send-file';

            const body = isVoiceNote
                ? { phone, audio: dbContent.mediaUrl }             // PTT
                : { phone, file: dbContent.mediaUrl, fileName: dto.filename || 'audio.mp3' }; // arquivo

            this.logger.log(`[Z-API API] Sending ${isVoiceNote ? 'PTT Message' : 'Audio File'} to ${to}...`);
            // MOCKED HTTP execution (replace with actual when doing real WA)
            // const res = await axios.post(`${base}${endpoint}`, body, { headers });
            // return res.data?.zaapId || res.data?.messageId;
            return "mock-zapi-audio-id";
        }

        // ... resto do método ...
        return "mock-zapi-other-message-id";
    }
}
