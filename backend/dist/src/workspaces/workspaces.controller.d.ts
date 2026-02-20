import { WorkspacesService } from './workspaces.service';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    findOne(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plan: string;
        name: string;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    update(workspaceId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plan: string;
        name: string;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    getMembers(workspaceId: string): Promise<({
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
        workspaceId: string;
        userId: string;
        role: string;
    })[]>;
    inviteMember(workspaceId: string, body: {
        email: string;
        role: string;
    }): Promise<{
        id: string;
        workspaceId: string;
        userId: string;
        role: string;
    }>;
    updateMember(workspaceId: string, userId: string, data: any): Promise<{
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
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        shortcut: string;
    }[]>;
    createQuickReply(workspaceId: string, data: any): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        shortcut: string;
    }>;
    deleteQuickReply(workspaceId: string, id: string): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        shortcut: string;
    }>;
}
