import { PrismaService } from '../prisma/prisma.service';
import { SectorsService } from '../sectors/sectors.service';
import { BillingService } from '../billing/billing.service';
export declare class WorkspacesService {
    private prisma;
    private sectorsService;
    private billingService;
    constructor(prisma: PrismaService, sectorsService: SectorsService, billingService: BillingService);
    findOne(workspaceId: string): Promise<{
        plan: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        taxId: string | null;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    update(workspaceId: string, data: any): Promise<{
        plan: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        taxId: string | null;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    createDefaultWorkspace(userId: string, name?: string, taxId?: string): Promise<{
        plan: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        taxId: string | null;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    getMembers(workspaceId: string): Promise<({
        user: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string | null;
            lastName: string | null;
            niche: string | null;
            password: string;
            status: string;
        };
    } & {
        id: string;
        userId: string;
        workspaceId: string;
        role: string;
    })[]>;
    inviteMember(workspaceId: string, email: string, role: string): Promise<{
        id: string;
        userId: string;
        workspaceId: string;
        role: string;
    }>;
    updateMember(workspaceId: string, userId: string, role?: string): Promise<{
        success: boolean;
    }>;
    removeMember(workspaceId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getBusinessHours(workspaceId: string): Promise<{
        id: string;
        workspaceId: string;
        dayOfWeek: number;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }[]>;
    updateBusinessHours(workspaceId: string, hours: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getQuickReplies(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        shortcut: string;
        content: string;
    }[]>;
    createQuickReply(workspaceId: string, shortcut: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        shortcut: string;
        content: string;
    }>;
    deleteQuickReply(workspaceId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        shortcut: string;
        content: string;
    }>;
}
