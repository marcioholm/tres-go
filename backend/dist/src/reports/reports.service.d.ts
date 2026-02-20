import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(workspaceId: string, range: {
        start: string;
        end: string;
    }): Promise<{
        totalConversations: {
            value: number;
            change: number;
        };
        resolved: {
            value: number;
            rate: number;
        };
        newContacts: {
            value: number;
            change: number;
        };
        tma: {
            value: string;
            change: number;
        };
    }>;
    getAgentPerformance(workspaceId: string, range: {
        start: string;
        end: string;
    }): Promise<{
        name: string;
        conversations: number;
        resolved: number;
        tma: string;
    }[]>;
    getVolumeByDay(workspaceId: string, range: {
        start: string;
        end: string;
    }): Promise<{
        name: string;
        total: number;
    }[]>;
    getDashboard(workspaceId: string, startDate?: string, endDate?: string): Promise<{
        totalConversations: number;
        resolvedConversations: number;
        responseRate: string;
        avgResponseTime: string;
        avgResolutionTime: string;
        volumeByDay: any[];
    }>;
    getAgents(workspaceId: string, startDate?: string, endDate?: string): Promise<{
        name: string;
        total: number;
        resolved: number;
        rating: number;
        status: string;
    }[]>;
    getSectorMetrics(workspaceId: string): Promise<{
        id: string;
        name: string;
        color: string;
        totalConversations: number;
        openConversations: number;
        resolvedConversations: number;
        avgResponseTime: string;
        slaCompliance: string;
    }[]>;
}
