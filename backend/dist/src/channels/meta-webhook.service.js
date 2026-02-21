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
exports.MetaWebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let MetaWebhookService = class MetaWebhookService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateSignature(body, signature) {
        if (!signature)
            return false;
        const expected = crypto
            .createHmac('sha256', process.env.META_APP_SECRET || '')
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === `sha256=${expected}`;
    }
    async processWebhook(body) {
        try {
            const entries = body.entry || [];
            for (const entry of entries) {
                const pageId = entry.id;
                const channel = await this.prisma.channel.findFirst({
                    where: { pageId, status: 'ACTIVE' },
                });
                if (!channel)
                    continue;
                const messaging = entry.messaging || entry.changes?.[0]?.value?.messages || [];
                for (const event of messaging) {
                    if (event.message) {
                        await this.handleIncomingMessage(channel, event);
                    }
                    else if (event.read) {
                        await this.handleMessageRead(channel, event);
                    }
                    else if (event.delivery) {
                        await this.handleMessageDelivery(channel, event);
                    }
                }
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === 'messages') {
                            await this.handleWhatsAppWebhook(channel, change.value);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error('Webhook processing error:', err);
        }
    }
    async handleIncomingMessage(channel, event) {
        const senderId = event.sender.id;
        const text = event.message?.text || '';
        const attachments = event.message?.attachments || [];
        const mid = event.message?.mid;
        console.log(`Incoming message from ${senderId} on channel ${channel.id}: ${text}`);
    }
    async handleWhatsAppWebhook(channel, value) {
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        for (const msg of messages) {
            const phone = msg.from;
            const contact = contacts.find((c) => c.wa_id === phone);
            const senderName = contact?.profile?.name || phone;
            console.log(`Incoming WhatsApp message from ${phone} (${senderName}) on channel ${channel.id}: ${msg.text?.body || ''}`);
        }
    }
    async handleMessageRead(channel, event) {
        console.log(`Message read on channel ${channel.id}`);
    }
    async handleMessageDelivery(channel, event) {
        console.log(`Message delivered on channel ${channel.id}`);
    }
};
exports.MetaWebhookService = MetaWebhookService;
exports.MetaWebhookService = MetaWebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetaWebhookService);
//# sourceMappingURL=meta-webhook.service.js.map