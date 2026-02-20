import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class ContactsService {
    private prisma;
    private auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    findAll(workspaceId: string, params: any): Promise<{
        id: string;
        email: string | null;
        name: string;
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
    }[]>;
    findOne(workspaceId: string, id: string): Promise<{
        conversations: {
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
        }[];
        notes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string | null;
            contactId: string;
            content: string;
        }[];
        ContactToTag: ({
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
        email: string | null;
        name: string;
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
    }>;
    create(workspaceId: string, data: any): Promise<{
        id: string;
        email: string | null;
        name: string;
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
    }>;
    update(workspaceId: string, id: string, data: any, userId?: string): Promise<{
        id: string;
        email: string | null;
        name: string;
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
    }>;
    updateSource(workspaceId: string, id: string, sourceData: any, userId?: string): Promise<{
        id: string;
        email: string | null;
        name: string;
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
    }>;
    delete(workspaceId: string, id: string, userId?: string): Promise<{
        id: string;
        email: string | null;
        name: string;
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
    }>;
    addTag(workspaceId: string, contactId: string, tagId: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    removeTag(workspaceId: string, contactId: string, tagId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addNote(workspaceId: string, contactId: string, userId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string | null;
        contactId: string;
        content: string;
    }>;
    getSourcesReport(workspaceId: string): Promise<{
        source: string;
        count: number;
    }[]>;
    importCsv(workspaceId: string, file: any): Promise<{
        imported: number;
        skipped: number;
        errors: any[];
    }>;
    bulkTagAction(workspaceId: string, data: {
        contactIds: string[];
        tagId: string;
        action: 'add' | 'remove';
    }): Promise<{
        count: number;
    }>;
}
