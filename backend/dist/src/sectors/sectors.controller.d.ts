import { SectorsService } from './sectors.service';
export declare class SectorsController {
    private readonly sectorsService;
    constructor(sectorsService: SectorsService);
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
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    })[]>;
    findOne(workspaceId: string, id: string): Promise<{
        _count: {
            conversations: number;
        };
        kanbanBoard: {
            id: string;
            name: string;
            createdAt: Date;
            workspaceId: string;
            sectorId: string | null;
        };
        members: ({
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
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
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
            isActive: boolean;
            createdAt: Date;
            sectorId: string;
            type: import(".prisma/client").$Enums.AutoRuleType;
            value: string;
            priority: number;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    create(workspaceId: string, body: any): Promise<{
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
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    update(workspaceId: string, id: string, body: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    delete(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        color: string;
        icon: string;
        isDefault: boolean;
        order: number;
    }>;
    addMember(workspaceId: string, sectorId: string, body: {
        userId: string;
        role: 'AGENT' | 'SUPERVISOR';
    }): Promise<{
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
    updateMemberRole(workspaceId: string, sectorId: string, userId: string, body: {
        role: 'AGENT' | 'SUPERVISOR';
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        role: import(".prisma/client").$Enums.SectorRole;
        sectorId: string;
    }>;
}
