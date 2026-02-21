"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MetaOAuthService = class MetaOAuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.APP_ID = process.env.META_APP_ID;
        this.APP_SECRET = process.env.META_APP_SECRET;
        this.REDIRECT_URI = `${process.env.FRONTEND_URL}/api/auth/meta/callback`;
    }
    generateOAuthUrl(type, workspaceId, channelName) {
        const scope = type === 'INSTAGRAM'
            ? 'instagram_business_basic,instagram_business_manage_messages,instagram_manage_comments,pages_show_list,pages_messaging'
            : 'pages_show_list,pages_messaging,pages_read_engagement';
        const state = Buffer.from(JSON.stringify({ workspaceId, type, channelName, ts: Date.now() })).toString('base64');
        const params = new URLSearchParams({
            client_id: this.APP_ID,
            redirect_uri: this.REDIRECT_URI,
            scope,
            response_type: 'code',
            state,
        });
        return { url: `https://www.facebook.com/v19.0/dialog/oauth?${params}` };
    }
    async exchangeCodeForToken(code) {
        const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
            `client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}` +
            `&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&code=${code}`);
        const tokenData = await tokenRes.json();
        const { access_token: userToken } = tokenData;
        if (!userToken) {
            console.error('Error exchanging code for token:', tokenData);
            throw new Error('Failed to exchange code for token');
        }
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?` +
            `fields=id,name,picture,access_token&access_token=${userToken}`);
        const { data: pages } = await pagesRes.json();
        const longLivedPages = await Promise.all(pages.map(async (page) => {
            const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
                `grant_type=fb_exchange_token&client_id=${this.APP_ID}` +
                `&client_secret=${this.APP_SECRET}&fb_exchange_token=${page.access_token}`);
            const { access_token } = await llRes.json();
            return { ...page, access_token };
        }));
        return { accessToken: userToken, pages: longLivedPages };
    }
    async getInstagramAccount(pageId, pageToken) {
        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}?` +
            `fields=instagram_business_account{id,username,name}&access_token=${pageToken}`);
        const data = await res.json();
        if (!data.instagram_business_account)
            return null;
        return {
            igAccountId: data.instagram_business_account.id,
            username: data.instagram_business_account.username,
            name: data.instagram_business_account.name,
        };
    }
    async subscribePageToWebhook(pageId, pageToken) {
        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries'],
                access_token: pageToken,
            }),
        });
        const data = await res.json();
        return data.success === true;
    }
};
exports.MetaOAuthService = MetaOAuthService;
exports.MetaOAuthService = MetaOAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetaOAuthService);
//# sourceMappingURL=meta-oauth.service.js.map