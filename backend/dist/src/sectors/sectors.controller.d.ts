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
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        order: number;
        color: string;
        icon: string;
        isDefault: boolean;
    })[]>;
    findOne(workspaceId: string, id: string): Promise<{
        _count: {
            conversations: number;
        };
        kanbanBoard: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            name: string;
            sectorId: string | null;
        };
        members: ({
            user: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                email: string;
                password: string;
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
            createdAt: Date;
            isActive: boolean;
            sectorId: string;
            value: string;
            type: import(".prisma/client").$Enums.AutoRuleType;
            priority: number;
        }[];
    } & {
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        order: number;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    create(workspaceId: string, body: any): Promise<{
        kanbanBoard: {
            id: string;
            workspaceId: string;
            createdAt: Date;
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
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        order: number;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    update(workspaceId: string, id: string, body: any): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        order: number;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    delete(workspaceId: string, id: string): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        order: number;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    addMember(workspaceId: string, sectorId: string, body: {
        userId: string;
        role: 'AGENT' | 'SUPERVISOR';
    }): Promise<{
        user: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
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
