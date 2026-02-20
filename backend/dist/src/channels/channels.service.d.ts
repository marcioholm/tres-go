import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
export declare class ChannelsService {
    private prisma;
    private billing;
    constructor(prisma: PrismaService, billing: BillingService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        isActive: boolean;
        config: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        isActive: boolean;
        config: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }[]>;
}
