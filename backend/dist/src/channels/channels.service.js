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
exports.ChannelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_service_1 = require("../billing/billing.service");
let ChannelsService = class ChannelsService {
    constructor(prisma, billing) {
        this.prisma = prisma;
        this.billing = billing;
        this.pageSessions = new Map();
    }
    async create(workspaceId, data) {
        const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de canais (${limitInfo.limit}) atingido para o seu plano.`);
        }
        return this.prisma.channel.create({
            data: {
                ...data,
                workspaceId,
                config: data.config || {},
                isActive: true,
            },
        });
    }
    async findAll(workspaceId) {
        return this.prisma.channel.findMany({
            where: { workspaceId },
        });
    }
    async remove(id, workspaceId) {
        return this.prisma.channel.delete({
            where: { id, workspaceId },
        });
    }
    async update(id, body, workspaceId) {
        return this.prisma.channel.update({
            where: { id, workspaceId },
            data: body,
        });
    }
    async requestWhatsAppCode(body, workspaceId) {
        const { phoneNumber, method, channelName } = body;
        const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
        if (!limitInfo.allowed) {
            throw new common_1.BadRequestException(`Limite de canais (${limitInfo.limit}) atingido.`);
        }
        const channel = await this.prisma.channel.create({
            data: {
                workspaceId,
                type: 'WHATSAPP',
                name: channelName,
                status: 'CONNECTING',
                phoneNumber,
            },
        });
        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/request_code`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code_method: method,
                    language: 'pt_BR',
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                console.error('WhatsApp request code error:', error);
                await this.prisma.channel.delete({ where: { id: channel.id } });
                throw new common_1.BadRequestException('Falha ao solicitar código de verificação');
            }
            return { channelId: channel.id };
        }
        catch (err) {
            await this.prisma.channel.delete({ where: { id: channel.id } });
            throw new common_1.BadRequestException('Erro de comunicação com a Meta');
        }
    }
    async verifyWhatsAppCode(body, workspaceId) {
        const channel = await this.prisma.channel.findFirst({
            where: { id: body.channelId, workspaceId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Canal não encontrado');
        const res = await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/verify_code`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: body.code }),
        });
        if (!res.ok) {
            throw new common_1.BadRequestException('Código inválido ou expirado');
        }
        return this.prisma.channel.update({
            where: { id: channel.id },
            data: { status: 'ACTIVE' },
        });
    }
    async storePageSession(pages) {
        const key = Math.random().toString(36).substring(7);
        this.pageSessions.set(key, pages);
        return key;
    }
    async getPageSession(key) {
        return this.pageSessions.get(key);
    }
};
exports.ChannelsService = ChannelsService;
exports.ChannelsService = ChannelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        billing_service_1.BillingService])
], ChannelsService);
//# sourceMappingURL=channels.service.js.map