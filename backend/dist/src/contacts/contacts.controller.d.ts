import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    getSourcesReport(workspaceId: string): Promise<{
        source: string;
        count: number;
    }[]>;
    findAll(workspaceId: string, search?: string, cursor?: string, limit?: string): Promise<{
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
    }[]>;
    findOne(workspaceId: string, id: string): Promise<{
        conversations: {
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
        }[];
        notes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            agentId: string | null;
            content: string;
        }[];
        ContactToTag: ({
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
    }>;
    create(workspaceId: string, data: any): Promise<{
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
    }>;
    update(workspaceId: string, id: string, data: any, req: any): Promise<{
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
    }>;
    updateSource(workspaceId: string, id: string, data: any, req: any): Promise<{
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
    }>;
    remove(workspaceId: string, id: string, req: any): Promise<{
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
    }>;
    addTag(workspaceId: string, id: string, tagId: string): Promise<{
        id: string;
        workspaceId: string | null;
        name: string;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    removeTag(workspaceId: string, id: string, tagId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addNote(workspaceId: string, id: string, body: {
        content: string;
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        contactId: string;
        agentId: string | null;
        content: string;
    }>;
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
