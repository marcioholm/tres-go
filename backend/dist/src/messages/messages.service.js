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
const axios_1 = require("axios");
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
    async sendViaWhatsappOfficial(channel, to, dto, dbContent) {
        const url = `https://graph.facebook.com/v19.0/${channel.phoneNumberId || process.env.META_PHONE_NUMBER_ID}/messages`;
        const token = channel.accessToken || process.env.META_SYSTEM_USER_TOKEN;
        const headers = { Authorization: `Bearer ${token}` };
        let body = {
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
        }
        else if (dto.type === 'IMAGE' || dto.type === 'VIDEO' || dto.type === 'DOCUMENT') {
            const type = dto.type.toLowerCase();
            body.type = type;
            body[type] = {
                link: dbContent.mediaUrl,
                caption: dbContent.body
            };
        }
        else {
            body.type = 'text';
            body.text = { body: dbContent.body || dto.text || '' };
        }
        try {
            this.logger.log(`[Official API] Sending Message to ${to}...`);
            const res = await axios_1.default.post(url, body, { headers });
            return res.data?.messages?.[0]?.id;
        }
        catch (error) {
            this.logger.error(`Failed to send message via Meta API`, error.response?.data || error.message);
            throw error;
        }
    }
    async sendViaZapi(channel, to, dto, dbContent) {
        const config = channel.config || {};
        const base = `https://api.z-api.io/instances/${config.instanceId}/token/${config.instanceToken}`;
        const headers = { 'Client-Token': config.clientToken };
        const phone = to.replace(/\D/g, '');
        let endpoint = '/send-text';
        let body = { phone };
        if (dbContent.isPtt || dto.type === 'AUDIO') {
            const isVoiceNote = dbContent.isPtt !== false;
            endpoint = isVoiceNote ? '/send-audio' : '/send-file';
            if (isVoiceNote) {
                body.audio = dbContent.mediaUrl;
            }
            else {
                body.file = dbContent.mediaUrl;
                body.fileName = dto.filename || 'audio.mp3';
            }
        }
        else if (dto.type === 'IMAGE') {
            endpoint = '/send-image';
            body.image = dbContent.mediaUrl;
            body.caption = dbContent.body;
        }
        else if (dto.type === 'VIDEO') {
            endpoint = '/send-video';
            body.video = dbContent.mediaUrl;
        }
        else if (dto.type === 'DOCUMENT') {
            endpoint = '/send-document';
            body.document = dbContent.mediaUrl;
            body.fileName = dto.filename || 'document.pdf';
        }
        else {
            body.message = dbContent.body || dto.text || '';
        }
        try {
            this.logger.log(`[Z-API API] Sending Message to ${phone} via ${endpoint}...`);
            const res = await axios_1.default.post(`${base}${endpoint}`, body, { headers });
            return res.data?.zaapId || res.data?.messageId;
        }
        catch (error) {
            this.logger.error(`Failed to send message via Z-API`, error.response?.data || error.message);
            throw error;
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map