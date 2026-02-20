import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    findAll(workspaceId: string, status?: string, unreadOnly?: string, search?: string, cursor?: string, limit?: string): Promise<({
        sector: {
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
        };
        contact: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
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
        ConversationToTag: ({
            Tag: {
                id: string;
                workspaceId: string | null;
                name: string;
                color: string | null;
                type: import(".prisma/client").$Enums.TagType;
            };
        } & {
            A: string;
            B: string;
        })[];
    } & {
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
    })[]>;
    getKanban(workspaceId: string): Promise<{
        columns: any[];
    }>;
    findOne(workspaceId: string, id: string): Promise<{
        contact: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
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
            conversationId: string;
            type: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            fromAgent: boolean;
            isInternalNote: boolean;
            externalId: string | null;
        }[];
    } & {
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
    }>;
    transfer(workspaceId: string, id: string, data: {
        agentId?: string;
        sectorId?: string;
        note?: string;
    }): Promise<{
        sector: {
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
        };
    } & {
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
    }>;
    assign(workspaceId: string, id: string, agentId: string): Promise<{
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
    }>;
    resolve(workspaceId: string, id: string): Promise<{
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
    }>;
    reopen(workspaceId: string, id: string): Promise<{
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        sectorId: string | null;
        contactId: string;
        agentId: string | null;
        kanbanColumn: string | null;
        channelId: string;
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
