import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { Channel } from '@prisma/client';
export declare class ChannelsService {
    private prisma;
    private billing;
    constructor(prisma: PrismaService, billing: BillingService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ChannelType;
        name: string;
        status: import(".prisma/client").$Enums.ChannelStatus;
        pageId: string | null;
        pageName: string | null;
        pageAvatar: string | null;
        accessToken: string | null;
        igAccountId: string | null;
        phoneNumber: string | null;
        phoneNumberId: string | null;
        wabaId: string | null;
        displayName: string | null;
        webhookSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ChannelType;
        name: string;
        status: import(".prisma/client").$Enums.ChannelStatus;
        pageId: string | null;
        pageName: string | null;
        pageAvatar: string | null;
        accessToken: string | null;
        igAccountId: string | null;
        phoneNumber: string | null;
        phoneNumberId: string | null;
        wabaId: string | null;
        displayName: string | null;
        webhookSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
    }[]>;
    remove(id: string, workspaceId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ChannelType;
        name: string;
        status: import(".prisma/client").$Enums.ChannelStatus;
        pageId: string | null;
        pageName: string | null;
        pageAvatar: string | null;
        accessToken: string | null;
        igAccountId: string | null;
        phoneNumber: string | null;
        phoneNumberId: string | null;
        wabaId: string | null;
        displayName: string | null;
        webhookSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
    }>;
    update(id: string, body: {
        name?: string;
        displayName?: string;
    }, workspaceId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ChannelType;
        name: string;
        status: import(".prisma/client").$Enums.ChannelStatus;
        pageId: string | null;
        pageName: string | null;
        pageAvatar: string | null;
        accessToken: string | null;
        igAccountId: string | null;
        phoneNumber: string | null;
        phoneNumberId: string | null;
        wabaId: string | null;
        displayName: string | null;
        webhookSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
    }>;
    requestWhatsAppCode(body: {
        phoneNumber: string;
        method: 'SMS' | 'VOICE';
        channelName: string;
    }, workspaceId: string): Promise<{
        channelId: string;
    }>;
    verifyWhatsAppCode(body: {
        channelId: string;
        code: string;
    }, workspaceId: string): Promise<Channel>;
    private pageSessions;
    storePageSession(pages: any[]): Promise<string>;
    getPageSession(key: string): Promise<any>;
}
