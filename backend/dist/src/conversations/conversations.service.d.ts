import { PrismaService } from '../prisma/prisma.service';
import { SectorsService } from '../sectors/sectors.service';
import { AppGateway } from '../gateway/app.gateway';
import { BillingService } from '../billing/billing.service';
export declare class ConversationsService {
    private prisma;
    private sectorsService;
    private gateway;
    private billing;
    constructor(prisma: PrismaService, sectorsService: SectorsService, gateway: AppGateway, billing: BillingService);
    create(workspaceId: string, data: any): Promise<{
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
    findAll(workspaceId: string, params: any): Promise<({
        contact: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
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
    findOne(workspaceId: string, id: string): Promise<{
        contact: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
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
    getKanban(workspaceId: string): Promise<{
        columns: any[];
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
    updateKanban(workspaceId: string, id: string, column: string, order?: number): Promise<{
        success: boolean;
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
}
