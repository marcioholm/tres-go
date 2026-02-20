import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    findAll(workspaceId: string, status?: string, unreadOnly?: string, search?: string, cursor?: string, limit?: string): Promise<({
        contact: {
            id: string;
            email: string | null;
            name: string | null;
            firstName: string | null;
            lastName: string | null;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
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
        };
        ConversationToTag: ({
            Tag: {
                id: string;
                name: string;
                workspaceId: string | null;
                color: string | null;
                type: import(".prisma/client").$Enums.TagType;
            };
        } & {
            A: string;
            B: string;
        })[];
    } & {
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    })[]>;
    getKanban(workspaceId: string): Promise<{
        columns: any[];
    }>;
    findOne(workspaceId: string, id: string): Promise<{
        contact: {
            id: string;
            email: string | null;
            name: string | null;
            firstName: string | null;
            lastName: string | null;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
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
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    transfer(workspaceId: string, id: string, data: {
        agentId?: string;
        sectorId?: string;
        note?: string;
    }): Promise<{
        sector: {
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
        };
    } & {
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    assign(workspaceId: string, id: string, agentId: string): Promise<{
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    resolve(workspaceId: string, id: string): Promise<{
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    reopen(workspaceId: string, id: string): Promise<{
        kanbanColumn: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
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
