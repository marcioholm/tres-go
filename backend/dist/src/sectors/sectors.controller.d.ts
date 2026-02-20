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
    findOne(workspaceId: string, id: string): Promise<{
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
                name: string;
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
    update(workspaceId: string, id: string, body: any): Promise<{
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
    delete(workspaceId: string, id: string): Promise<{
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
    addMember(workspaceId: string, sectorId: string, body: {
        userId: string;
        role: 'AGENT' | 'SUPERVISOR';
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
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
    updateMemberRole(workspaceId: string, sectorId: string, userId: string, body: {
        role: 'AGENT' | 'SUPERVISOR';
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        sectorId: string;
        role: import(".prisma/client").$Enums.SectorRole;
    }>;
}
