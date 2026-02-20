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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(workspaceId, data) {
        const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const sale = await this.prisma.sale.create({
            data: {
                workspace: { connect: { id: workspaceId } },
                contact: { connect: { id: data.contactId } },
                agent: { connect: { id: data.userId } },
                amount: totalAmount,
                title: data.title || 'Nova Venda',
                status: data.status || 'COMPLETED',
                conversation: data.conversationId ? { connect: { id: data.conversationId } } : undefined,
                items: {
                    create: data.items.map((item) => ({
                        name: item.description || item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice
                    }))
                }
            },
            include: { items: true }
        });
        await this.checkVipStatus(data.contactId, workspaceId);
        return sale;
    }
    async findAll(workspaceId, params) {
        return this.prisma.sale.findMany({
            where: {
                workspaceId,
                contactId: params.contactId,
            },
            include: {
                items: true,
                contact: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSummary(workspaceId) {
        const totalSales = await this.prisma.sale.aggregate({
            where: { workspaceId, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { _all: true }
        });
        return {
            totalRevenue: totalSales._sum.amount || 0,
            totalCount: totalSales._count._all || 0
        };
    }
    async checkVipStatus(contactId, workspaceId) {
        const aggregates = await this.prisma.sale.aggregate({
            where: { contactId, status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const lifetimeValue = aggregates._sum.amount || 0;
        if (lifetimeValue > 5000) {
            let vipTag = await this.prisma.tag.findFirst({
                where: { workspaceId, name: 'VIP' }
            });
            if (!vipTag) {
                vipTag = await this.prisma.tag.create({
                    data: { workspaceId, name: 'VIP', color: '#FFD700', type: 'STATUS' }
                });
            }
            const hasTag = await this.prisma.contactToTag.findFirst({
                where: { A: contactId, B: vipTag.id }
            });
            if (!hasTag) {
                await this.prisma.contactToTag.create({
                    data: { A: contactId, B: vipTag.id }
                });
            }
        }
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map