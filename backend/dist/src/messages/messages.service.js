"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async findAll(workspaceId, conversationId, cursor) {
        let messages = [];
        let cursorError = false;
        try {
            messages = await this.prisma.message.findMany({
                where: { conversationId, conversation: { workspaceId } },
                take: 20,
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (e) {
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
                const formattedArchived = archived.map(msg => ({
                    ...msg,
                    isArchived: true
                }));
                messages = [...messages, ...formattedArchived];
            }
            catch (e) {
            }
        }
        return messages;
    }
    async create(workspaceId, data) {
        const contentPayload = data.text ? data.text : undefined;
        let dbContent = { body: contentPayload };
        if (data.content && typeof data.content === 'object') {
            dbContent = data.content;
        }
        else {
            dbContent.mediaUrl = data.mediaUrl;
            dbContent.mediaType = data.type?.toLowerCase();
            if (data.isPtt) {
                dbContent.isPtt = true;
                dbContent.duration = data.duration;
                dbContent.waveform = data.waveform;
            }
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                type: data.type || (dbContent.mediaUrl ? (dbContent.isPtt ? 'AUDIO' : 'DOCUMENT') : 'TEXT'),
                content: dbContent,
                fromAgent: true,
                status: 'PENDING'
            }
        });
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: { contact: true, channel: true }
        });
        if (conversation && conversation.channel) {
            try {
                const channelProvider = conversation.channel.type || 'META_CLOUD';
                if (channelProvider === 'WHATSAPP') {
                    await this.sendViaWhatsappOfficial(conversation.channel, conversation.contact.phone || '', data, dbContent);
                }
                await this.prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'DELIVERED' }
                });
            }
            catch (error) {
                this.logger.error(`Error sending message down channel`, error);
                await this.prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'FAILED' }
                });
            }
        }
        return message;
    }
    async sendViaWhatsappOfficial(config, to, dto, dbContent) {
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
            return "mock-official-message-id";
        }
        if (dto.type === 'AUDIO') {
            this.logger.log(`[Official API] Sending Normal Audio File to ${to}...`);
            return "mock-normalaudio-id";
        }
        return "mock-other-message-id";
    }
    async sendViaZapi(config, to, dto, dbContent) {
        const base = `https://api.z-api.io/instances/${config.instanceId}/token/${config.instanceToken}`;
        const headers = { 'Client-Token': config.clientToken };
        const phone = to.replace(/\D/g, '');
        if (dbContent.isPtt || dto.type === 'AUDIO') {
            const isVoiceNote = dbContent.isPtt !== false;
            const endpoint = isVoiceNote ? '/send-audio' : '/send-file';
            const body = isVoiceNote
                ? { phone, audio: dbContent.mediaUrl }
                : { phone, file: dbContent.mediaUrl, fileName: dto.filename || 'audio.mp3' };
            this.logger.log(`[Z-API API] Sending ${isVoiceNote ? 'PTT Message' : 'Audio File'} to ${to}...`);
            return "mock-zapi-audio-id";
        }
        return "mock-zapi-other-message-id";
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map