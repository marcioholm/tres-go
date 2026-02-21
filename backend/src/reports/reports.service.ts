import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardMetrics(workspaceId: string, range: { start: string, end: string }) {
        const start = range.start ? new Date(range.start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = range.end ? new Date(range.end) : new Date();

        const [total, resolved, newContacts] = await Promise.all([
            this.prisma.conversation.count({ where: { workspaceId, createdAt: { gte: start, lte: end } } }),
            this.prisma.conversation.count({ where: { workspaceId, status: 'CLOSED', updatedAt: { gte: start, lte: end } } }),
            this.prisma.contact.count({ where: { workspaceId, createdAt: { gte: start, lte: end } } })
        ]);

        return {
            totalConversations: { value: total, change: 0 },
            resolved: { value: resolved, rate: total > 0 ? Math.round((resolved / total) * 100) : 0 },
            newContacts: { value: newContacts, change: 0 },
            tma: { value: "0m", change: 0 }
        };
    }

    async getAgentPerformance(workspaceId: string, range: { start: string, end: string }) {
        const agents = await this.prisma.workspaceUser.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: { name: true, firstName: true }
                }
            }
        });

        const performance = await Promise.all(agents.map(async (awu) => {
            const count = await this.prisma.conversation.count({
                where: { workspaceId, agentId: awu.userId }
            });
            const resolved = await this.prisma.conversation.count({
                where: { workspaceId, agentId: awu.userId, status: 'CLOSED' }
            });
            return {
                name: awu.user.firstName || awu.user.name || "Agente",
                conversations: count,
                resolved: resolved,
                tma: "0m"
            };
        }));

        return performance;
    }

    async getVolumeByDay(workspaceId: string, range: { start: string, end: string }) {
        // Simple aggregate for the last 7 days if no range
        const start = range.start ? new Date(range.start) : new Date(new Date().setDate(new Date().getDate() - 7));

        const conversations = await this.prisma.conversation.findMany({
            where: { workspaceId, createdAt: { gte: start } },
            select: { createdAt: true }
        });

        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const volume = days.map(day => ({ name: day, total: 0 }));

        conversations.forEach(c => {
            const dayIdx = c.createdAt.getDay();
            volume[dayIdx].total++;
        });

        return volume;
    }

    async getSectorMetrics(workspaceId: string) {
        const sectors = await this.prisma.sector.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: {
                        conversations: true
                    }
                }
            }
        });

        return sectors.map(sector => ({
            id: sector.id,
            name: sector.name,
            color: sector.color,
            totalConversations: sector._count.conversations,
            openConversations: 0, // Simplified for now
            resolvedConversations: 0,
            avgResponseTime: "0m",
            slaCompliance: "100%"
        }));
    }
}
