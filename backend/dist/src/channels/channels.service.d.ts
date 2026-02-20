import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
export declare class ChannelsService {
    private prisma;
    private billing;
    constructor(prisma: PrismaService, billing: BillingService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        isActive: boolean;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        isActive: boolean;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
