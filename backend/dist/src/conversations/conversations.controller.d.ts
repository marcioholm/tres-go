import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    findAll(workspaceId: string, status?: string, unreadOnly?: string, search?: string, cursor?: string, limit?: string): Promise<({
        contact: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            name: string | null;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            source: import(".prisma/client").$Enums.TrafficSource | null;
            sourceMedium: string | null;
            sourceCampaign: string | null;
            sourceContent: string | null;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            referredBy: string | null;
        };
        sector: {
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
        };
        ConversationToTag: ({
            Tag: {
                id: string;
                workspaceId: string | null;
                name: string;
                type: import(".prisma/client").$Enums.TagType;
                color: string | null;
            };
        } & {
            A: string;
            B: string;
        })[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    })[]>;
    getKanban(workspaceId: string): Promise<{
        columns: any[];
    }>;
    findOne(workspaceId: string, id: string): Promise<{
        contact: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            name: string | null;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            source: import(".prisma/client").$Enums.TrafficSource | null;
            sourceMedium: string | null;
            sourceCampaign: string | null;
            sourceContent: string | null;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            referredBy: string | null;
        };
        messages: {
            id: string;
            status: string;
            createdAt: Date;
            type: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            conversationId: string;
            fromAgent: boolean;
            isInternalNote: boolean;
            externalId: string | null;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    }>;
    transfer(workspaceId: string, id: string, data: {
        agentId?: string;
        sectorId?: string;
        note?: string;
    }): Promise<{
        sector: {
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
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    }>;
    assign(workspaceId: string, id: string, agentId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    }>;
    resolve(workspaceId: string, id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    }>;
    reopen(workspaceId: string, id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        contactId: string;
        channelId: string;
        sectorId: string | null;
    }>;
    updateKanban(workspaceId: string, id: string, body: {
        column: string;
        order?: number;
    }): Promise<{
        success: boolean;
    }>;
    addTag(workspaceId: string, id: string, tagId: string): {
        success: boolean;
    };
    removeTag(workspaceId: string, id: string, tagId: string): {
        success: boolean;
    };
}
