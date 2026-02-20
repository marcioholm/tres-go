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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const conversations_service_1 = require("../conversations/conversations.service");
const app_gateway_1 = require("../gateway/app.gateway");
let WebhooksService = class WebhooksService {
    constructor(prisma, conversationsService, gateway) {
        this.prisma = prisma;
        this.conversationsService = conversationsService;
        this.gateway = gateway;
    }
    verifyWhatsapp(mode, token) {
        return mode === 'subscribe' && token === 'northway_omni_token';
    }
    async processWhatsappMessage(workspaceId, body) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        const contact = value?.contacts?.[0];
        if (!message)
            return;
        const senderPhone = message.from;
        const senderName = contact?.profile?.name || senderPhone;
        const messageBody = message.text?.body || message.type;
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
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                workspaceId,
                contactId: dbContact.id,
                status: 'OPEN'
            }
        });
        if (!conversation) {
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
                messageBody,
                contactPhone: senderPhone
            });
        }
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
        if (conversation.sectorId) {
            this.gateway.emitToSector(workspaceId, conversation.sectorId, 'newMessage', {
                conversationId: conversation.id,
                message: newMessage
            });
        }
        else {
            this.gateway.emitToWorkspace(workspaceId, 'newMessage', {
                conversationId: conversation.id,
                message: newMessage
            });
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        conversations_service_1.ConversationsService,
        app_gateway_1.AppGateway])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map