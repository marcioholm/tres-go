import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectorsService } from '../sectors/sectors.service';
import { AppGateway } from '../gateway/app.gateway';
import { BillingService } from '../billing/billing.service';
import { SessionService } from '../performance/session.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);
  constructor(
    private prisma: PrismaService,
    private sectorsService: SectorsService,
    private gateway: AppGateway,
    private billing: BillingService,
    private sessionService: SessionService,
  ) { }

  async create(workspaceId: string, data: any) {
    try {
      this.logger.log(`[ConversationsService] Creating conversation for workspace: ${workspaceId}, contact: ${data.contactId}`);

      // Check billing limits (Conversations per month)
      const limitInfo = await this.billing.checkLimit(
        workspaceId,
        'conversations',
      );
      if (!limitInfo.allowed) {
        throw new Error(
          `Limite de conversas mensais (${limitInfo.limit}) atingido para o seu plano.`,
        );
      }

      // Auto-detect sector if not provided
      let sectorId = data.sectorId;
      if (!sectorId && data.messageBody) {
        sectorId = await this.sectorsService.findMatchingSector(
          workspaceId,
          data.messageBody,
          data.contactPhone,
        );
      }

      // Default to "Novo Lead" column (order 0) in the sector's board
      let kanbanColumnId = data.kanbanColumnId;
      if (!kanbanColumnId && sectorId) {
        const board = await this.prisma.kanbanBoard.findFirst({
          where: { sectorId },
          include: { columns: { orderBy: { order: 'asc' }, take: 1 } },
        });
        if (board && board.columns.length > 0) {
          kanbanColumnId = board.columns[0].id;
        }
      }

      const conversation = await this.prisma.conversation.create({
        data: {
          ...data,
          workspaceId,
          sectorId,
          kanbanColumn: kanbanColumnId,
          status: 'OPEN',
        },
        include: { sector: true, contact: true, channel: true },
      });

      console.log('Emitindo new_conversation para workspace:', workspaceId);
      this.gateway.emitToWorkspace(workspaceId, 'new_conversation', conversation);

      if (data.agentId) {
        await this.sessionService.startSession(conversation.id, data.agentId);
      }

      return conversation;
    } catch (error) {
      this.logger.error(`[ConversationsService] Error creating conversation:`, error);
      throw error;
    }
  }

  async findAll(workspaceId: string, params: any) {
    // Basic implementation - with sector filter
    const where: any = { workspaceId };
    if (params.status) where.status = params.status;
    if (params.sectorId) where.sectorId = params.sectorId;
    if (params.search) {
      where.OR = [
        { contact: { name: { contains: params.search, mode: 'insensitive' } } },
        { contact: { phone: { contains: params.search } } },
      ];
    }

    const conversations = await this.prisma.conversation.findMany({
      where,
      include: {
        channel: true,
        contact: true,
        ConversationToTag: { include: { Tag: true } },
        sector: true,
        messages: { take: 1, orderBy: { createdAt: 'desc' } }, // Include last message for preview
      },
      take: Number(params.limit) || 20,
      skip: params.cursor ? 1 : 0,
      orderBy: { updatedAt: 'desc' },
    });

    // Map messages and name for frontend compatibility
    return conversations.map((conv) => {
      const c = conv.contact as any;
      return {
        ...conv,
        // Show @handle for IG/FB, phone for WhatsApp, then name, then externalId
        name: c?.handle
          ? `@${c.handle}`
          : c?.name
            ? c.name
            : c?.phone
              ? c.phone
              : c?.externalId || 'Sem nome',
        messages: conv.messages.map((m) => ({
          ...m,
          text:
            typeof m.content === 'string'
              ? m.content
              : (m.content as any)?.text || (m.content as any)?.body || '',
        })),
      };
    });
  }

  async findOne(workspaceId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        channel: true,
        contact: true,
        messages: { take: 50, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!conversation) return null;

    return {
      ...conversation,
      name:
        conversation.contact?.name || conversation.contact?.phone || 'Sem nome',
      messages: conversation.messages
        .map((m) => ({
          ...m,
          text:
            typeof m.content === 'string'
              ? m.content
              : (m.content as any)?.text || (m.content as any)?.body || '',
        }))
        .reverse(), // Show in chronological order for frontend
    };
  }

  async getKanban(workspaceId: string) {
    // Placeholder for Kanban logic
    return { columns: [] };
  }

  async assign(workspaceId: string, id: string, agentId: string) {
    const result = await this.prisma.conversation.update({
      where: { id },
      data: { agentId },
    });
    await this.sessionService.startSession(id, agentId);
    return result;
  }

  async resolve(workspaceId: string, id: string) {
    const result = await this.prisma.conversation.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });
    await this.sessionService.endActiveSession(id, 'RESOLVED');
    return result;
  }

  async reopen(workspaceId: string, id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { status: 'OPEN' },
    });
  }

  async updateKanban(
    workspaceId: string,
    id: string,
    column: string,
    order?: number,
  ) {
    // Placeholder
    return { success: true };
  }

  async transfer(
    workspaceId: string,
    id: string,
    data: { agentId?: string; sectorId?: string; note?: string },
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) throw new Error('Conversation not found');

    const updateData: any = {};
    if (data.agentId) {
      updateData.agentId = data.agentId;
    } else if (data.sectorId) {
      updateData.agentId = null; // Unassign when moving to a sector queue
    }

    if (data.sectorId) {
      updateData.sectorId = data.sectorId;
    }

    // 1. Update Conversation
    const updatedConversation = await this.prisma.conversation.update({
      where: { id },
      data: updateData,
      include: { sector: true },
    });

    // Session tracking for transfer
    if (data.agentId) {
      await this.sessionService.startSession(id, data.agentId);
    } else {
      await this.sessionService.endActiveSession(id, 'TRANSFERRED');
    }

    // 2. Record Transfer History
    await this.prisma.conversationTransfer.create({
      data: {
        conversationId: id,
        fromSectorId: conversation.sectorId,
        toSectorId: data.sectorId || conversation.sectorId || '',
        fromAgentId: conversation.agentId,
        toAgentId: data.agentId || null,
        note: data.note,
      },
    });

    // 3. Create System Message (Internal Note)
    let systemText = `Atendimento transferido`;
    if (data.sectorId && data.sectorId !== conversation.sectorId) {
      const targetSector = await this.prisma.sector.findUnique({
        where: { id: data.sectorId },
      });
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
        content: systemText,
        status: 'SENT',
      },
    });

    // Emit socket event via Gateway
    const socketMessage = {
      ...newMessage,
      text:
        typeof newMessage.content === 'string'
          ? newMessage.content
          : (newMessage.content as any)?.text || '',
    };

    if (updatedConversation.sectorId) {
      this.gateway.emitToSector(
        workspaceId,
        updatedConversation.sectorId,
        'newMessage',
        {
          conversationId: id,
          message: socketMessage,
        },
      );
    } else {
      this.gateway.emitToWorkspace(workspaceId, 'newMessage', {
        conversationId: id,
        message: socketMessage,
      });
    }
  }

  async findOrCreate(
    workspaceId: string,
    channelId: string,
    contactId: string,
  ) {
    try {
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          workspaceId,
          channelId,
          contactId,
          status: 'OPEN',
        },
        include: { sector: true, contact: true },
      });

      if (!conversation) {
        conversation = await this.create(workspaceId, {
          channelId,
          contactId,
        });
      }

      return conversation;
    } catch (error) {
      console.error('[ConversationsService] Error in findOrCreate:', error);
      throw error;
    }
  }
}
