import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays } from 'date-fns';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) { }

  async create(workspaceId: string, data: any) {
    const totalAmount = data.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    const sale = await this.prisma.sale.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        contact: { connect: { id: data.contactId } },
        agent: { connect: { id: data.agentId || data.userId } },
        amount: totalAmount,
        title: data.title || 'Nova Venda',
        description: data.description,
        status: data.status || 'COMPLETED',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PENDING',
        notes: data.notes,
        saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
        conversation: data.conversationId
          ? { connect: { id: data.conversationId } }
          : undefined,
        channel: data.channelId
          ? { connect: { id: data.channelId } }
          : undefined,
        items: {
          create: data.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Validar Status VIP (Ex: Acima de R$ 5000 em compras)
    if (sale.paymentStatus === 'PAID') {
      await this.checkVipStatus(data.contactId, workspaceId);
    }

    return sale;
  }

  async findAll(workspaceId: string, params: any) {
    const { contactId, agentId, channelId, paymentStatus, startDate, endDate, limit = 50, cursor } = params;

    return this.prisma.sale.findMany({
      where: {
        workspaceId,
        contactId,
        agentId,
        channelId,
        paymentStatus,
        saleDate: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        items: true,
        contact: { select: { id: true, name: true, firstName: true, lastName: true, avatarUrl: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
        channel: { select: { id: true, name: true, type: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async update(workspaceId: string, saleId: string, data: any) {
    return this.prisma.sale.update({
      where: { id: saleId, workspaceId },
      data: {
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        status: data.status,
      },
    });
  }

  async remove(workspaceId: string, saleId: string) {
    return this.prisma.sale.delete({
      where: { id: saleId, workspaceId },
    });
  }

  async getReport(workspaceId: string, params: any) {
    const { startDate, endDate } = params;
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();

    const sales = await this.prisma.sale.findMany({
      where: {
        workspaceId,
        saleDate: { gte: start, lte: end },
      },
      include: {
        items: true,
        agent: { select: { id: true, firstName: true, lastName: true } },
        channel: { select: { id: true, name: true, type: true } },
      },
    });

    const totalRevenue = sales.reduce((acc, s) => acc + (s.paymentStatus === 'PAID' ? s.amount : 0), 0);
    const totalSales = sales.length;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const pendingRevenue = sales.reduce((acc, s) => acc + (s.paymentStatus === 'PENDING' ? s.amount : 0), 0);
    const paidRevenue = totalRevenue;

    // Aggregations
    const byAgent = this.aggregateByAgent(sales);
    const byChannel = this.aggregateByChannel(sales);
    const byProduct = this.aggregateByProduct(sales);
    const byPeriod = this.aggregateByPeriod(sales, start, end);

    return {
      totalRevenue,
      totalSales,
      averageTicket,
      pendingRevenue,
      paidRevenue,
      byAgent,
      byChannel,
      byProduct,
      byPeriod,
    };
  }

  private aggregateByAgent(sales: any[]) {
    const agentsMap = new Map();
    sales.forEach(s => {
      if (!s.agent) return;
      const id = s.agent.id;
      const current = agentsMap.get(id) || {
        agentId: id,
        agentName: `${s.agent.firstName || ''} ${s.agent.lastName || ''}`.trim(),
        totalSales: 0,
        totalRevenue: 0,
      };
      current.totalSales += 1;
      if (s.paymentStatus === 'PAID') current.totalRevenue += s.amount;
      agentsMap.set(id, current);
    });
    return Array.from(agentsMap.values()).map(a => ({
      ...a,
      averageTicket: a.totalSales > 0 ? a.totalRevenue / a.totalSales : 0,
    }));
  }

  private aggregateByChannel(sales: any[]) {
    const channelsMap = new Map();
    sales.forEach(s => {
      const type = s.channel?.type || 'OUTRO';
      const name = s.channel?.name || 'Manual';
      const current = channelsMap.get(type) || { channelType: type, channelName: name, totalSales: 0, totalRevenue: 0 };
      current.totalSales += 1;
      if (s.paymentStatus === 'PAID') current.totalRevenue += s.amount;
      channelsMap.set(type, current);
    });
    return Array.from(channelsMap.values());
  }

  private aggregateByProduct(sales: any[]) {
    const productsMap = new Map();
    sales.forEach(s => {
      s.items.forEach((item: any) => {
        const current = productsMap.get(item.name) || { name: item.name, quantity: 0, totalRevenue: 0 };
        current.quantity += item.quantity;
        if (s.paymentStatus === 'PAID') current.totalRevenue += item.total;
        productsMap.set(item.name, current);
      });
    });
    return Array.from(productsMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  private aggregateByPeriod(sales: any[], start: Date, end: Date) {
    const periodMap = new Map();
    sales.forEach(s => {
      const date = s.saleDate.toISOString().split('T')[0];
      const current = periodMap.get(date) || { date, totalSales: 0, totalRevenue: 0 };
      current.totalSales += 1;
      if (s.paymentStatus === 'PAID') current.totalRevenue += s.amount;
      periodMap.set(date, current);
    });
    return Array.from(periodMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async checkVipStatus(contactId: string, workspaceId: string) {
    const aggregates = await this.prisma.sale.aggregate({
      where: { contactId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const lifetimeValue = aggregates._sum.amount || 0;

    if (lifetimeValue > 5000) {
      // Find VIP tag
      let vipTag = await this.prisma.tag.findFirst({
        where: { workspaceId, name: 'VIP' },
      });

      if (!vipTag) {
        vipTag = await this.prisma.tag.create({
          data: { workspaceId, name: 'VIP', color: '#FFD700', type: 'STATUS' },
        });
      }

      // Check if contact already has tag
      const hasTag = await this.prisma.contactToTag.findFirst({
        where: { A: contactId, B: vipTag.id },
      });

      if (!hasTag) {
        await this.prisma.contactToTag.create({
          data: { A: contactId, B: vipTag.id },
        });
      }
    }
  }
}
