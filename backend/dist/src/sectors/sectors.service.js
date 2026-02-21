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
exports.SectorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_service_1 = require("../billing/billing.service");
let SectorsService = class SectorsService {
    constructor(prisma, billing) {
        this.prisma = prisma;
        this.billing = billing;
    }
    async findAll(workspaceId) {
        return this.prisma.sector.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { members: true, conversations: true }
                },
                slaConfig: true
            },
            orderBy: { order: 'asc' }
        });
    }
    async findOne(workspaceId, sectorId) {
        return this.prisma.sector.findUnique({
            where: { id: sectorId, workspaceId },
            include: {
                members: { include: { user: true } },
                slaConfig: true,
                autoRules: true,
                kanbanBoard: true,
                _count: {
                    select: { conversations: true }
                }
            }
        });
    }
    async create(workspaceId, data, options = {}) {
        if (data.isDefault) {
            await this.prisma.sector.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }
        if (!options.skipLimitCheck) {
            const limitInfo = await this.billing.checkLimit(workspaceId, 'sectors');
            if (!limitInfo.allowed) {
                throw new Error(`Limite de setores (${limitInfo.limit}) atingido para o seu plano.`);
            }
        }
        return this.prisma.sector.create({
            data: {
                ...data,
                workspaceId,
                kanbanBoard: {
                    create: {
                        workspaceId,
                        name: `Kanban - ${data.name}`,
                        columns: {
                            createMany: {
                                data: [
                                    { name: 'Novo Lead', order: 0, color: '#3b82f6' },
                                    { name: 'Contato', order: 1, color: '#eab308' },
                                    { name: 'Proposta', order: 2, color: '#a855f7' },
                                    { name: 'Negociação', order: 3, color: '#f97316' },
                                    { name: 'Ganho', order: 4, color: '#22c55e', isWon: true },
                                    { name: 'Perdido', order: 5, color: '#ef4444', isLost: true },
                                ]
                            }
                        }
                    }
                },
                slaConfig: {
                    create: {
                        firstResponseTime: 5,
                        resolutionTime: 120
                    }
                }
            },
            include: { kanbanBoard: true, slaConfig: true }
        });
    }
    async update(workspaceId, sectorId, data) {
        if (data.isDefault) {
            await this.prisma.sector.updateMany({
                where: { workspaceId, isDefault: true, id: { not: sectorId } },
                data: { isDefault: false }
            });
        }
        return this.prisma.sector.update({
            where: { id: sectorId, workspaceId },
            data
        });
    }
    async delete(workspaceId, sectorId) {
        const sector = await this.prisma.sector.findUnique({
            where: { id: sectorId },
            include: { _count: { select: { conversations: true } } }
        });
        if (sector._count.conversations > 0) {
            const defaultSector = await this.prisma.sector.findFirst({
                where: { workspaceId, isDefault: true, id: { not: sectorId } }
            });
            if (!defaultSector) {
                throw new Error("Cannot delete sector with open conversations without another default sector to migrate to.");
            }
            await this.prisma.conversation.updateMany({
                where: { sectorId: sectorId },
                data: { sectorId: defaultSector.id }
            });
        }
        return this.prisma.sector.delete({
            where: { id: sectorId, workspaceId }
        });
    }
    async addMember(workspaceId, sectorId, userId, role) {
        return this.prisma.sectorMember.create({
            data: {
                sectorId,
                userId,
                role
            },
            include: { user: true }
        });
    }
    async removeMember(workspaceId, sectorId, userId) {
        return this.prisma.sectorMember.delete({
            where: {
                sectorId_userId: { sectorId, userId }
            }
        });
    }
    async updateMemberRole(workspaceId, sectorId, userId, role) {
        return this.prisma.sectorMember.update({
            where: {
                sectorId_userId: { sectorId, userId }
            },
            data: { role }
        });
    }
    async findMatchingSector(workspaceId, messageBody, senderPhone) {
        const rules = await this.prisma.sectorAutoRule.findMany({
            where: {
                sector: { workspaceId, isActive: true },
                isActive: true
            },
            include: { sector: true },
            orderBy: { priority: 'asc' }
        });
        for (const rule of rules) {
            if (rule.type === 'KEYWORD') {
                const keywords = rule.value.split(',').map(k => k.trim().toLowerCase());
                if (keywords.some(k => messageBody.toLowerCase().includes(k))) {
                    return rule.sectorId;
                }
            }
        }
        const defaultSector = await this.prisma.sector.findFirst({
            where: { workspaceId, isDefault: true }
        });
        if (defaultSector)
            return defaultSector.id;
        const firstSector = await this.prisma.sector.findFirst({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' }
        });
        return firstSector?.id;
    }
    async ensureDefaultSectors(workspaceId) {
        const count = await this.prisma.sector.count({
            where: { workspaceId }
        });
        if (count === 0) {
            await this.create(workspaceId, {
                name: 'Geral',
                color: '#6366f1',
                isDefault: true,
                isActive: true,
                order: 0
            }, { skipLimitCheck: true });
        }
    }
};
exports.SectorsService = SectorsService;
exports.SectorsService = SectorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        billing_service_1.BillingService])
], SectorsService);
//# sourceMappingURL=sectors.service.js.map