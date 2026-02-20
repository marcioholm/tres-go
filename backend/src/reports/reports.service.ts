import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardMetrics(workspaceId: string, range: { start: string, end: string }) {
        // Mock data for now, but structured correctly
        return {
            totalConversations: { value: 1284, change: 20.1 },
            resolved: { value: 1100, rate: 85 },
            newContacts: { value: 573, change: 201 },
            tma: { value: "4m 32s", change: -60 } // seconds
        };
    }

    async getAgentPerformance(workspaceId: string, range: { start: string, end: string }) {
        return [
            { name: "Alice", conversations: 120, resolved: 110, tma: "5m" },
            { name: "Bob", conversations: 98, resolved: 90, tma: "4m 30s" },
        ];
    }

    async getVolumeByDay(workspaceId: string, range: { start: string, end: string }) {
        return [
            { name: "Seg", total: 40 },
            { name: "Ter", total: 30 },
            { name: "Qua", total: 45 },
            { name: "Qui", total: 50 },
            { name: "Sex", total: 60 },
            { name: "Sab", total: 20 },
            { name: "Dom", total: 10 },
        ];
    }

    async getDashboard(workspaceId: string, startDate?: string, endDate?: string) {
        // Mock Data / Basic Implementation
        return {
            totalConversations: 120,
            resolvedConversations: 100,
            responseRate: '98%',
            avgResponseTime: '2m',
            avgResolutionTime: '15m',
            volumeByDay: []
        };
    }

    async getAgents(workspaceId: string, startDate?: string, endDate?: string) {
        return [
            { name: 'Agent Smith', total: 50, resolved: 48, rating: 4.9, status: 'ONLINE' }
        ];
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

        // Calculate some real-ish metrics (in a real app we'd do aggregation queries)
        return sectors.map(sector => ({
            id: sector.id,
            name: sector.name,
            color: sector.color,
            totalConversations: sector._count.conversations,
            openConversations: Math.floor(sector._count.conversations * 0.4), // Mock logic for breakdown
            resolvedConversations: Math.floor(sector._count.conversations * 0.5),
            avgResponseTime: "5m", // Mock
            slaCompliance: "92%"   // Mock
        }));
    }
}
