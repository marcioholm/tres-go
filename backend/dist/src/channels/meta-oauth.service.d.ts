import { PrismaService } from '../prisma/prisma.service';
export declare class MetaOAuthService {
    private readonly prisma;
    private readonly APP_ID;
    private readonly APP_SECRET;
    private readonly REDIRECT_URI;
    constructor(prisma: PrismaService);
    generateOAuthUrl(type: 'INSTAGRAM' | 'MESSENGER', workspaceId: string, channelName: string): {
        url: string;
    };
    exchangeCodeForToken(code: string): Promise<{
        accessToken: string;
        pages: Array<{
            id: string;
            name: string;
            picture: any;
            access_token: string;
        }>;
    }>;
    getInstagramAccount(pageId: string, pageToken: string): Promise<{
        igAccountId: string;
        username: string;
        name: string;
    } | null>;
    subscribePageToWebhook(pageId: string, pageToken: string): Promise<boolean>;
}
