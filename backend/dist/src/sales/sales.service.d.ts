import { PrismaService } from '../prisma/prisma.service';
export declare class SalesService {
    private prisma;
    constructor(prisma: PrismaService);
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
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SaleStatus;
        workspaceId: string;
        agentId: string;
        contactId: string;
        amount: number;
        conversationId: string | null;
        title: string;
        saleDate: Date;
    }>;
    findAll(workspaceId: string, params: any): Promise<({
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
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SaleStatus;
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
    private checkVipStatus;
}
