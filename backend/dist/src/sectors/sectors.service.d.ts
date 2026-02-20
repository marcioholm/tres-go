import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
export declare class SectorsService {
    private prisma;
    private billing;
    constructor(prisma: PrismaService, billing: BillingService);
    findAll(workspaceId: string): Promise<({
        _count: {
            conversations: number;
            members: number;
        };
        slaConfig: {
            id: string;
            sectorId: string;
            firstResponseTime: number;
            resolutionTime: number;
            warningThreshold: number;
            criticalThreshold: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    })[]>;
    findOne(workspaceId: string, sectorId: string): Promise<{
        kanbanBoard: {
            id: string;
            name: string;
            createdAt: Date;
            workspaceId: string;
            sectorId: string | null;
        };
        _count: {
            conversations: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                firstName: string | null;
                lastName: string | null;
                niche: string | null;
                password: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            sectorId: string;
            role: import(".prisma/client").$Enums.SectorRole;
        })[];
        slaConfig: {
            id: string;
            sectorId: string;
            firstResponseTime: number;
            resolutionTime: number;
            warningThreshold: number;
            criticalThreshold: number;
        };
        autoRules: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            sectorId: string;
            type: import(".prisma/client").$Enums.AutoRuleType;
            value: string;
            priority: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    create(workspaceId: string, data: any): Promise<{
        kanbanBoard: {
            id: string;
            name: string;
            createdAt: Date;
            workspaceId: string;
            sectorId: string | null;
        };
        slaConfig: {
            id: string;
            sectorId: string;
            firstResponseTime: number;
            resolutionTime: number;
            warningThreshold: number;
            criticalThreshold: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    update(workspaceId: string, sectorId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    delete(workspaceId: string, sectorId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    addMember(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR'): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            firstName: string | null;
            lastName: string | null;
            niche: string | null;
            password: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        sectorId: string;
        role: import(".prisma/client").$Enums.SectorRole;
    }>;
    removeMember(workspaceId: string, sectorId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        sectorId: string;
        role: import(".prisma/client").$Enums.SectorRole;
    }>;
    updateMemberRole(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR'): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        sectorId: string;
        role: import(".prisma/client").$Enums.SectorRole;
    }>;
    findMatchingSector(workspaceId: string, messageBody: string, senderPhone: string): Promise<string>;
    ensureDefaultSectors(workspaceId: string): Promise<void>;
}
