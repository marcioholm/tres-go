import { SalesService } from './sales.service';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(workspaceId: string, data: any): Promise<{
        items: {
            id: string;
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
            saleId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        workspaceId: string;
        agentId: string;
        contactId: string;
        amount: number;
        conversationId: string | null;
        title: string;
        saleDate: Date;
    }>;
    findAll(workspaceId: string, contactId?: string): Promise<({
        contact: {
            name: string;
        };
        items: {
            id: string;
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
            saleId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SaleStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        workspaceId: string;
        agentId: string;
        contactId: string;
        amount: number;
        conversationId: string | null;
        title: string;
        saleDate: Date;
    })[]>;
    getSummary(workspaceId: string): Promise<{
        totalRevenue: number;
        totalCount: number;
    }>;
}
