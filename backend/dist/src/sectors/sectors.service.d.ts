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
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    })[]>;
    findOne(workspaceId: string, sectorId: string): Promise<{
        _count: {
            conversations: number;
        };
        members: ({
            user: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                firstName: string | null;
                lastName: string | null;
                niche: string | null;
                password: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
        })[];
        kanbanBoard: {
            id: string;
            createdAt: Date;
            workspaceId: string;
            name: string;
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
        autoRules: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            type: import(".prisma/client").$Enums.AutoRuleType;
            sectorId: string;
            value: string;
            priority: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    create(workspaceId: string, data: any): Promise<{
        kanbanBoard: {
            id: string;
            createdAt: Date;
            workspaceId: string;
            name: string;
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
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    update(workspaceId: string, sectorId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    delete(workspaceId: string, sectorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    addMember(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR'): Promise<{
        user: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            firstName: string | null;
            lastName: string | null;
            niche: string | null;
            password: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        role: import(".prisma/client").$Enums.SectorRole;
        sectorId: string;
    }>;
    removeMember(workspaceId: string, sectorId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        role: import(".prisma/client").$Enums.SectorRole;
        sectorId: string;
    }>;
    updateMemberRole(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR'): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        role: import(".prisma/client").$Enums.SectorRole;
        sectorId: string;
    }>;
    findMatchingSector(workspaceId: string, messageBody: string, senderPhone: string): Promise<string>;
    ensureDefaultSectors(workspaceId: string): Promise<void>;
}
