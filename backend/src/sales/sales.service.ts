import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async create(workspaceId: string, data: any) {
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
                    create: data.items.map((item: any) => ({
                        name: item.description || item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice
                    }))
                }
            },
            include: { items: true }
        });

        // Validar Status VIP (Ex: Acima de R$ 5000 em compras)
        await this.checkVipStatus(data.contactId, workspaceId);

        return sale;
    }

    async findAll(workspaceId: string, params: any) {
        return this.prisma.sale.findMany({
            where: {
                workspaceId,
                contactId: params.contactId, // Optional filter
            },
            include: {
                items: true,
                contact: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getSummary(workspaceId: string) {
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

    private async checkVipStatus(contactId: string, workspaceId: string) {
        const aggregates = await this.prisma.sale.aggregate({
            where: { contactId, status: 'COMPLETED' },
            _sum: { amount: true }
        });

        const lifetimeValue = aggregates._sum.amount || 0;

        if (lifetimeValue > 5000) {
            // Find VIP tag
            let vipTag = await this.prisma.tag.findFirst({
                where: { workspaceId, name: 'VIP' }
            });

            if (!vipTag) {
                vipTag = await this.prisma.tag.create({
                    data: { workspaceId, name: 'VIP', color: '#FFD700', type: 'STATUS' }
                });
            }

            // Check if contact already has tag
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
}
