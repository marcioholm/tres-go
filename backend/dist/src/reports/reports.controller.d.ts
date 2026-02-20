import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardMetrics(workspaceId: string, start: string, end: string): Promise<{
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
    getAgentPerformance(workspaceId: string, start: string, end: string): Promise<{
        name: string;
        conversations: number;
        resolved: number;
        tma: string;
    }[]>;
    getVolumeByDay(workspaceId: string, start: string, end: string): Promise<{
        name: string;
        total: number;
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
