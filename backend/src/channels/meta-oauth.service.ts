import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaOAuthService {
    private readonly APP_ID = process.env.META_APP_ID;
    private readonly APP_SECRET = process.env.META_APP_SECRET;
    private readonly REDIRECT_URI = process.env.META_REDIRECT_URI;

    constructor(private readonly prisma: PrismaService) { }

    // Gerar URL de autorização OAuth
    generateOAuthUrl(
        type: 'INSTAGRAM' | 'MESSENGER',
        workspaceId: string,
        channelName: string,
    ): { url: string } {
        // Scope depende do tipo de canal
        const scope =
            type === 'INSTAGRAM'
                ? 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_messaging'
                : 'pages_show_list,pages_messaging,pages_read_engagement';

        // State para prevenir CSRF e passar contexto
        const state = Buffer.from(
            JSON.stringify({ workspaceId, type, channelName, ts: Date.now() })
        ).toString('base64');

        const params = new URLSearchParams({
            client_id: this.APP_ID,
            redirect_uri: this.REDIRECT_URI,
            scope,
            response_type: 'code',
            state,
        });

        return { url: `https://www.facebook.com/v19.0/dialog/oauth?${params}` };
    }

    // Trocar code por Page Access Token
    async exchangeCodeForToken(code: string): Promise<{
        accessToken: string;
        pages: Array<{ id: string; name: string; picture: any; access_token: string }>;
    }> {
        // 1. Trocar code por user access token
        const tokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?` +
            `client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}` +
            `&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&code=${code}`
        );
        const tokenData = await tokenRes.json();
        const { access_token: userToken } = tokenData;

        if (!userToken) {
            console.error('Error exchanging code for token:', tokenData);
            throw new Error('Failed to exchange code for token');
        }

        // 2. Buscar páginas que o usuário administra
        const pagesRes = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts?` +
            `fields=id,name,picture,access_token&access_token=${userToken}`
        );
        const pagesData = await pagesRes.json();
        const pages = pagesData.data || [];

        // 3. Converter para Long-Lived Page Tokens (Páginas administradas retornam tokens de acesso)
        const longLivedPages = await Promise.all(
            pages.map(async (page: any) => {
                const llRes = await fetch(
                    `https://graph.facebook.com/v19.0/oauth/access_token?` +
                    `grant_type=fb_exchange_token&client_id=${this.APP_ID}` +
                    `&client_secret=${this.APP_SECRET}&fb_exchange_token=${page.access_token}`
                );
                const llData = await llRes.json();
                const access_token = llData.access_token || page.access_token;
                return { ...page, access_token };
            })
        );

        return { accessToken: userToken, pages: longLivedPages };
    }

    // Buscar Instagram Business Account vinculado à Página
    async getInstagramAccount(pageId: string, pageToken: string): Promise<{
        igAccountId: string;
        username: string;
        name: string;
    } | null> {
        const res = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}?` +
            `fields=instagram_business_account{id,username,name}&access_token=${pageToken}`
        );
        const data = await res.json();
        if (!data.instagram_business_account) return null;
        return {
            igAccountId: data.instagram_business_account.id,
            username: data.instagram_business_account.username,
            name: data.instagram_business_account.name,
        };
    }

    // Registrar webhook para a Página
    async subscribePageToWebhook(pageId: string, pageToken: string): Promise<boolean> {
        const res = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'],
                    access_token: pageToken,
                }),
            }
        );
        const data = await res.json();
        return data.success === true;
    }
}
