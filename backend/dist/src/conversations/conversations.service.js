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
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sectors_service_1 = require("../sectors/sectors.service");
const app_gateway_1 = require("../gateway/app.gateway");
const billing_service_1 = require("../billing/billing.service");
let ConversationsService = class ConversationsService {
    constructor(prisma, sectorsService, gateway, billing) {
        this.prisma = prisma;
        this.sectorsService = sectorsService;
        this.gateway = gateway;
        this.billing = billing;
    }
    async create(workspaceId, data) {
        const limitInfo = await this.billing.checkLimit(workspaceId, 'conversations');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de conversas mensais (${limitInfo.limit}) atingido para o seu plano.`);
        }
        let sectorId = data.sectorId;
        if (!sectorId && data.messageBody) {
            sectorId = await this.sectorsService.findMatchingSector(workspaceId, data.messageBody, data.contactPhone);
        }
        let kanbanColumnId = data.kanbanColumnId;
        if (!kanbanColumnId && sectorId) {
            const board = await this.prisma.kanbanBoard.findFirst({
                where: { sectorId },
                include: { columns: { orderBy: { order: 'asc' }, take: 1 } }
            });
            if (board && board.columns.length > 0) {
                kanbanColumnId = board.columns[0].id;
            }
        }
        return this.prisma.conversation.create({
            data: {
                ...data,
                workspaceId,
                sectorId,
                kanbanColumn: kanbanColumnId,
                status: 'OPEN'
            },
            include: { sector: true }
        });
    }
    async findAll(workspaceId, params) {
        const where = { workspaceId };
        if (params.status)
            where.status = params.status;
        if (params.sectorId)
            where.sectorId = params.sectorId;
        if (params.search) {
            where.OR = [
                { contact: { name: { contains: params.search, mode: 'insensitive' } } },
                { contact: { phone: { contains: params.search } } }
            ];
        }
        return this.prisma.conversation.findMany({
            where,
            include: {
                contact: true,
                ConversationToTag: { include: { Tag: true } },
                sector: true
            },
            take: params.limit,
            skip: params.cursor ? 1 : 0,
            orderBy: { updatedAt: 'desc' }
        });
    }
    async findOne(workspaceId, id) {
        return this.prisma.conversation.findUnique({
            where: { id },
            include: { contact: true, messages: { take: 50, orderBy: { createdAt: 'desc' } } },
        });
    }
    async getKanban(workspaceId) {
        return { columns: [] };
    }
    async assign(workspaceId, id, agentId) {
        return this.prisma.conversation.update({
            where: { id },
            data: { agentId },
        });
    }
    async resolve(workspaceId, id) {
        return this.prisma.conversation.update({
            where: { id },
            data: { status: 'RESOLVED' },
        });
    }
    async reopen(workspaceId, id) {
        return this.prisma.conversation.update({
            where: { id },
            data: { status: 'OPEN' },
        });
    }
    async updateKanban(workspaceId, id, column, order) {
        return { success: true };
    }
    async transfer(workspaceId, id, data) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
        });
        if (!conversation)
            throw new Error('Conversation not found');
        const updateData = {};
        if (data.agentId) {
            updateData.agentId = data.agentId;
        }
        else if (data.sectorId) {
            updateData.agentId = null;
        }
        if (data.sectorId) {
            updateData.sectorId = data.sectorId;
        }
        const updatedConversation = await this.prisma.conversation.update({
            where: { id },
            data: updateData,
            include: { sector: true }
        });
        await this.prisma.conversationTransfer.create({
            data: {
                conversationId: id,
                fromSectorId: conversation.sectorId,
                toSectorId: data.sectorId || conversation.sectorId || '',
                fromAgentId: conversation.agentId,
                toAgentId: data.agentId || null,
                note: data.note
            }
        });
        let systemText = `Atendimento transferido`;
        if (data.sectorId && data.sectorId !== conversation.sectorId) {
            const targetSector = await this.prisma.sector.findUnique({ where: { id: data.sectorId } });
            systemText += ` para o setor ${targetSector?.name || 'Desconhecido'}`;
        }
        if (data.note) {
            systemText += `. Obs: ${data.note}`;
        }
        const newMessage = await this.prisma.message.create({
            data: {
                conversationId: id,
                fromAgent: true,
                isInternalNote: true,
                type: 'text',
                content: { text: systemText },
                status: 'SENT'
            }
        });
        if (updatedConversation.sectorId) {
            this.gateway.emitToSector(workspaceId, updatedConversation.sectorId, 'conversationTransferred', {
                conversation: updatedConversation,
                transfer: { note: data.note, toAgentId: data.agentId }
            });
        }
        else {
            this.gateway.emitToWorkspace(workspaceId, 'conversationTransferred', {
                conversation: updatedConversation,
                transfer: { note: data.note, toAgentId: data.agentId }
            });
        }
        return updatedConversation;
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sectors_service_1.SectorsService,
        app_gateway_1.AppGateway,
        billing_service_1.BillingService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map