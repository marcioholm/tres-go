import { ChannelsService } from './channels.service';
import { MetaOAuthService } from './meta-oauth.service';
import { Response } from 'express';
export declare class ChannelsController {
    private readonly channelsService;
    private readonly metaOAuth;
    constructor(channelsService: ChannelsService, metaOAuth: MetaOAuthService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChannelStatus;
        workspaceId: string;
        type: import(".prisma/client").$Enums.ChannelType;
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
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChannelStatus;
        workspaceId: string;
        type: import(".prisma/client").$Enums.ChannelType;
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
    }[]>;
    update(workspaceId: string, id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChannelStatus;
        workspaceId: string;
        type: import(".prisma/client").$Enums.ChannelType;
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
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChannelStatus;
        workspaceId: string;
        type: import(".prisma/client").$Enums.ChannelType;
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
    }>;
    getMetaOAuthUrl(workspaceId: string, type: 'INSTAGRAM' | 'MESSENGER', name: string): {
        url: string;
    };
    metaCallback(code: string, res: Response): Promise<void>;
    getMetaPages(key: string): Promise<any>;
    requestWhatsAppCode(workspaceId: string, body: {
        phoneNumber: string;
        method: 'SMS' | 'VOICE';
        channelName: string;
    }): Promise<{
        channelId: string;
    }>;
    verifyWhatsAppCode(workspaceId: string, body: {
        channelId: string;
        code: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChannelStatus;
        workspaceId: string;
        type: import(".prisma/client").$Enums.ChannelType;
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
    }>;
}
