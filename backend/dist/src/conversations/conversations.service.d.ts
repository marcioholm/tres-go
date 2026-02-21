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
        contact: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            workspaceId: string;
            phone: string | null;
            externalId: string | null;
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
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            color: string;
            icon: string;
            isDefault: boolean;
            order: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    findAll(workspaceId: string, params: any): Promise<({
        contact: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            workspaceId: string;
            phone: string | null;
            externalId: string | null;
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
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    })[]>;
    findOne(workspaceId: string, id: string): Promise<{
        contact: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            workspaceId: string;
            phone: string | null;
            externalId: string | null;
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
            createdAt: Date;
            status: string;
            type: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            externalId: string | null;
            conversationId: string;
            fromAgent: boolean;
            isInternalNote: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    getKanban(workspaceId: string): Promise<{
        columns: any[];
    }>;
    assign(workspaceId: string, id: string, agentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    resolve(workspaceId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    reopen(workspaceId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
    updateKanban(workspaceId: string, id: string, column: string, order?: number): Promise<{
        success: boolean;
    }>;
    transfer(workspaceId: string, id: string, data: {
        agentId?: string;
        sectorId?: string;
        note?: string;
    }): Promise<void>;
    findOrCreate(workspaceId: string, channelId: string, contactId: string): Promise<{
        contact: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            workspaceId: string;
            phone: string | null;
            externalId: string | null;
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
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            color: string;
            icon: string;
            isDefault: boolean;
            order: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workspaceId: string;
        kanbanColumn: string | null;
        sectorId: string | null;
        agentId: string | null;
        contactId: string;
        channelId: string;
    }>;
}
