import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KanbanGateway } from './kanban/kanban.gateway';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class KanbanService {
  constructor(
    private prisma: PrismaService,
    private kanbanGateway: KanbanGateway,
    private auditLogsService: AuditLogsService,
  ) {}

  async getBoard(workspaceId: string) {
    let board = await this.prisma.kanbanBoard.findFirst({
      where: { workspaceId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              orderBy: { order: 'asc' },
              include: {
                contact: true,
                tags: { include: { tag: true } },
                agent: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      board = await this.createDefaultBoard(workspaceId);
    }

    return board;
  }

  async createDefaultBoard(workspaceId: string) {
    return this.prisma.kanbanBoard.create({
      data: {
        workspaceId,
        name: 'Funil de Vendas',
        columns: {
          create: [
            { name: 'Novo Lead', order: 0, color: '#fbbf24' },
            { name: 'Em Contato', order: 1, color: '#3b82f6' },
            { name: 'Agendado', order: 2, color: '#8b5cf6' },
            { name: 'Proposta', order: 3, color: '#ec4899' },
            { name: 'Negociação', order: 4, color: '#f97316' },
            { name: 'Ganho', order: 5, color: '#22c55e', isWon: true },
            { name: 'Perdido', order: 6, color: '#ef4444', isLost: true },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              include: {
                contact: true,
                tags: { include: { tag: true } },
                agent: true,
              },
            },
          },
        },
      },
    });
  }

  async createDeal(workspaceId: string, data: any, userId?: string) {
    let columnId = data.columnId;

    if (!columnId) {
      const board = await this.getBoard(workspaceId);
      if (board.columns.length > 0) {
        columnId = board.columns[0].id;
      } else {
        throw new Error('No columns found in board');
      }
    }

    // Determine order: last in column
    const lastDeal = await this.prisma.deal.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    const order = lastDeal ? lastDeal.order + 1 : 0;

    const deal = await this.prisma.deal.create({
      data: {
        workspaceId,
        columnId,
        contactId: data.contactId,
        title: data.title,
        value: data.value ? parseFloat(data.value) : undefined,
        agentId: data.agentId,
        notes: data.notes,
        order,
      },
    });

    this.kanbanGateway.notifyBoardUpdate(workspaceId);

    await this.auditLogsService.logEvent({
      workspaceId,
      userId,
      actionType: 'DEAL_CREATED',
      entityType: 'Deal',
      entityId: deal.id,
      newValue: deal,
    });

    return deal;
  }

  async updateDeal(
    workspaceId: string,
    dealId: string,
    data: any,
    userId?: string,
  ) {
    const oldDeal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });
    const deal = await this.prisma.deal.update({
      where: { id: dealId, workspaceId },
      data: {
        title: data.title,
        value: data.value ? parseFloat(data.value) : undefined,
        agentId: data.agentId,
        notes: data.notes,
        expectedCloseAt: data.expectedCloseAt
          ? new Date(data.expectedCloseAt)
          : undefined,
      },
    });

    await this.auditLogsService.logEvent({
      workspaceId,
      userId,
      actionType: 'DEAL_UPDATED',
      entityType: 'Deal',
      entityId: deal.id,
      oldValue: oldDeal,
      newValue: deal,
    });

    this.kanbanGateway.notifyBoardUpdate(workspaceId);
    return deal;
  }

  async moveDeal(
    workspaceId: string,
    dealId: string,
    targetColumnId: string,
    newOrder: number,
    userId?: string,
  ) {
    const oldDeal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });
    const deal = await this.prisma.deal.update({
      where: { id: dealId, workspaceId },
      data: {
        columnId: targetColumnId,
        order: newOrder,
      },
    });

    await this.auditLogsService.logEvent({
      workspaceId,
      userId,
      actionType: 'DEAL_MOVED',
      entityType: 'Deal',
      entityId: deal.id,
      oldValue: oldDeal,
      newValue: deal,
    });

    this.kanbanGateway.notifyBoardUpdate(workspaceId);
    return deal;
  }

  async deleteDeal(workspaceId: string, dealId: string, userId?: string) {
    const oldDeal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });
    const deal = await this.prisma.deal.delete({
      where: { id: dealId, workspaceId },
    });

    if (oldDeal) {
      await this.auditLogsService.logEvent({
        workspaceId,
        userId,
        actionType: 'DEAL_DELETED',
        entityType: 'Deal',
        entityId: deal.id,
        oldValue: oldDeal,
      });
    }

    this.kanbanGateway.notifyBoardUpdate(workspaceId);
    return deal;
  }

  async updateColumn(
    workspaceId: string,
    columnId: string,
    data: any,
    userId?: string,
  ) {
    const oldColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });
    const column = await this.prisma.kanbanColumn.update({
      where: { id: columnId },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    await this.auditLogsService.logEvent({
      workspaceId,
      userId,
      actionType: 'KANBAN_COLUMN_UPDATED',
      entityType: 'KanbanColumn',
      entityId: column.id,
      oldValue: oldColumn,
      newValue: column,
    });

    this.kanbanGateway.notifyBoardUpdate(workspaceId);
    return column;
  }
}
