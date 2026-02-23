import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';

@Injectable()
export class MetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async getAgentMetrics(workspaceId: string, agentId: string, period: any) {
    const config = await this.prisma.workspacePerformanceConfig.findUnique({
      where: { workspaceId },
    });

    const sessions = await this.prisma.conversationSession.findMany({
      where: {
        agentId,
        conversation: { workspaceId },
        createdAt: {
          gte: period.start,
          lte: period.end,
        },
      },
    });

    const totalSessions = sessions.length;
    if (totalSessions === 0) {
      return {
        avgFirstResponse: 0,
        avgResolution: 0,
        conversionRate: 0,
        totalSales: 0,
        fulfillment: {
          firstResponse: 'N/A',
          resolution: 'N/A',
          conversion: 'N/A',
        },
      };
    }

    // Médias
    const avgFirstResponse =
      sessions.reduce((acc, s) => acc + (s.firstResponseMinutes || 0), 0) /
        sessions.filter((s) => s.firstResponseMinutes != null).length || 0;

    const avgResolution =
      sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) /
        sessions.filter((s) => s.durationMinutes != null).length || 0;

    // Vendas/Conversões
    const totalSales = await this.prisma.conversationConversion.count({
      where: {
        workspaceId,
        primaryAgentId: agentId,
        convertedAt: {
          gte: period.start,
          lte: period.end,
        },
      },
    });

    const conversionRate = (totalSales / totalSessions) * 100;

    return {
      avgFirstResponse,
      avgResolution,
      conversionRate,
      totalSales,
      goals: {
        firstResponse: config?.firstResponseGoal || 5,
        resolution: config?.resolutionGoal || 1440,
        conversion: config?.conversionRateGoal || 30,
      },
      fulfillment: {
        firstResponse:
          avgFirstResponse <= (config?.firstResponseGoal || 5)
            ? 'MET'
            : 'BEHIND',
        resolution:
          avgResolution <= (config?.resolutionGoal || 1440) ? 'MET' : 'BEHIND',
        conversion:
          conversionRate >= (config?.conversionRateGoal || 30)
            ? 'MET'
            : 'BEHIND',
      },
    };
  }

  async getWorkspaceMetrics(workspaceId: string, period: any) {
    const agents = await this.prisma.workspaceUser.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    const metrics = await Promise.all(
      agents.map(async (au) => ({
        agentName: au.user.firstName || au.user.name || 'Agente',
        agentId: au.userId,
        ...(await this.getAgentMetrics(workspaceId, au.userId, period)),
      })),
    );

    return metrics;
  }

  async registerConversion(
    workspaceId: string,
    conversationId: string,
    agentId: string,
    value?: number,
  ) {
    const config = await this.prisma.workspacePerformanceConfig.findUnique({
      where: { workspaceId },
    });

    const sessions = await this.prisma.conversationSession.findMany({
      where: { conversationId },
      orderBy: { startedAt: 'asc' },
    });

    let primaryAgentId = agentId; // Default: quem clicou em converter

    if (config?.saleAttribution === 'FIRST_AGENT' && sessions.length > 0) {
      primaryAgentId = sessions[0].agentId;
    } else if (
      config?.saleAttribution === 'LAST_AGENT' &&
      sessions.length > 0
    ) {
      primaryAgentId = sessions[sessions.length - 1].agentId;
    }

    const allAgentIds = [...new Set(sessions.map((s) => s.agentId))];

    return this.prisma.conversationConversion.create({
      data: {
        conversationId,
        workspaceId,
        primaryAgentId,
        allAgentIds,
        value,
        convertedById: agentId,
      },
    });
  }
}
