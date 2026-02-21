import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MetaIntegrationService {
    private readonly APP_ID = process.env.META_APP_ID;
    private readonly APP_SECRET = process.env.META_APP_SECRET;
    private readonly REDIRECT_URI = process.env.META_REDIRECT_URI;
    private readonly STATE_SECRET = process.env.META_OAUTH_STATE_SECRET || 'fallback-secret-for-dev';
    private readonly SCOPES = process.env.META_SCOPES || 'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages';

    constructor(private readonly prisma: PrismaService) { }

    // ─── AUTH LOGIC ──────────────────────────────────────────────────────────

    generateState(): string {
        const nonce = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const payload = `${nonce}:${timestamp}`;
        const signature = crypto
            .createHmac('sha256', this.STATE_SECRET)
            .update(payload)
            .digest('hex');
        return Buffer.from(`${payload}:${signature}`).toString('base64');
    }

    validateState(state: string): boolean {
        try {
            const decoded = Buffer.from(state, 'base64').toString('utf8');
            const [nonce, timestamp, signature] = decoded.split(':');

            // Check expiry (30 min)
            const age = Date.now() - parseInt(timestamp);
            if (age > 30 * 60 * 1000) {
                console.error(`Meta OAuth State Expired: ${age}ms`);
                return false;
            }

            const expectedSignature = crypto
                .createHmac('sha256', this.STATE_SECRET)
                .update(`${nonce}:${timestamp}`)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('Meta OAuth State Signature Mismatch');
                return false;
            }

            return true;
        } catch (e) {
            console.error('Meta OAuth State Decode Error:', e.message);
            return false;
        }
    }

    getLoginUrl(): string {
        const state = this.generateState();
        const params = new URLSearchParams({
            client_id: this.APP_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            scope: this.SCOPES,
            state: state,
            auth_type: 'reauthenticate', // Forces Meta to show the permission dialog again
        });
        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }

    async handleCallback(code: string) {
        console.log('--- Meta Callback Deep Debug ---');
        // 1. Exchange short-lived token
        const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.APP_ID}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&client_secret=${this.APP_SECRET}&code=${code}`;
        const resShort = await fetch(exchangeUrl);
        const dataShort = await resShort.json();

        if (dataShort.error) {
            console.error('Step 1 Fail:', dataShort.error);
            throw new Error(`token_exchange: ${dataShort.error.message}`);
        }
        const userAccessToken = dataShort.access_token;

        // 2. Exchange long-lived token
        const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}&fb_exchange_token=${userAccessToken}`;
        const resLong = await fetch(longLivedUrl);
        const dataLong = await resLong.json();

        if (dataLong.error) {
            console.error('Step 2 Fail:', dataLong.error);
            throw new Error(`long_lived_exchange: ${dataLong.error.message}`);
        }

        const longLivedToken = dataLong.access_token;

        // 3. Get Pages
        const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,picture,access_token&access_token=${longLivedToken}`;
        const resPages = await fetch(pagesUrl);
        const pagesData = await resPages.json();

        if (pagesData.error) {
            console.error('Step 3 Fail:', pagesData.error);
            throw new Error(`pages_api: ${pagesData.error.message}`);
        }

        const pages = pagesData.data || [];

        if (pages.length === 0) {
            const raw = JSON.stringify(pagesData);
            console.warn('Empty Page List Response:', raw);
            // Including raw in the error details for the user to copy
            throw new Error(`no_pages_found_in_fb: ${raw}`);
        }

        // Phase 1: auto-select first page
        const page = pages[0];
        const pageId = page.id;
        const pageName = page.name;
        const pageAccessToken = page.access_token;

        // 4. Get IG Business Account
        const igUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
        const resIg = await fetch(igUrl);
        const igData = await resIg.json();
        const igAccountId = igData.instagram_business_account?.id || null;

        // 5. Persist
        // @ts-ignore - The model exists in DB but Prisma Client might need sync on build
        const integration = await this.prisma.metaIntegration.upsert({
            where: { pageId },
            update: {
                pageName,
                pageAccessToken,
                userAccessTokenLongLived: longLivedToken,
                igBusinessAccountId: igAccountId,
                status: 'active',
            },
            create: {
                pageId,
                pageName,
                pageAccessToken,
                userAccessTokenLongLived: longLivedToken,
                igBusinessAccountId: igAccountId,
                status: 'active',
            },
        });

        return integration;
    }

    // ─── UI TEMPLATES (NorthWay Identity) ────────────────────────────────────

    private getLayout(title: string, content: string): string {
        return `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} | NorthWay</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg: #0a0a0c;
                        --card: #141417;
                        --primary: #c52b2b;
                        --text-main: #f0f0f2;
                        --text-sub: #a1a1aa;
                        --border: #27272a;
                    }
                    * { margin:0; padding:0; box-sizing: border-box; }
                    body { 
                        background-color: var(--bg);
                        color: var(--text-main);
                        font-family: 'Inter', sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .card {
                        background: var(--card);
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 40px;
                        width: 100%;
                        max-width: 440px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        text-align: center;
                        animation: fadeIn 0.6s ease-out;
                    }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px; }
                    p { color: var(--text-sub); line-height: 1.6; margin-bottom: 24px; font-weight: 400; font-size: 15px; }
                    .btn {
                        display: inline-block;
                        background-color: var(--primary);
                        color: white;
                        text-decoration: none;
                        padding: 14px 28px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 15px;
                        transition: all 0.2s;
                        border: none;
                        cursor: pointer;
                        width: 100%;
                    }
                    .btn:hover { background-color: #a12323; transform: scale(1.02); }
                    .btn-secondary { background-color: transparent; border: 1px solid var(--border); color: var(--text-main); margin-top: 12px; }
                    .btn-secondary:hover { background-color: rgba(255,255,255,0.05); }
                    .footer { margin-top: 40px; color: #444; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 300; }
                    .list { text-align: left; margin: 24px 0; }
                    .list-item { display: flex; align-items: center; margin-bottom: 12px; color: var(--text-sub); font-size: 14px; }
                    .list-item::before { content: "✓"; color: var(--primary); margin-right: 12px; font-weight: bold; }
                    .info-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin: 24px 0; text-align: left; }
                    .info-label { display: block; font-size: 11px; color: var(--text-sub); text-transform: uppercase; margin-bottom: 4px; }
                    .info-value { font-weight: 600; font-size: 14px; color: var(--text-main); }
                </style>
            </head>
            <body>
                <div class="card">${content}</div>
                <div class="footer">A Ordem devolve a vida</div>
            </body>
            </html>
        `;
    }

    renderLandingPage(): string {
        const content = `
            <h1>Conectar Facebook & Instagram</h1>
            <p>Integre seus canais ao NorthWay CRM para centralizar gestão, histórico e automações.</p>
            <div class="list">
                <div class="list-item">Conexão segura via autorização Meta (OAuth)</div>
                <div class="list-item">Sem senha salva no navegador</div>
                <div class="list-item">Você pode desconectar quando quiser</div>
            </div>
            <a href="/auth/meta/login" class="btn">Autorizar com Meta</a>
            <p style="margin-top: 20px; font-size: 12px;">Você será redirecionado para autorizar e voltará automaticamente.</p>
        `;
        return this.getLayout('Conectar Meta', content);
    }

    renderSuccessPage(data: { pageName: string; pageId: string; igAccountId: string | null }): string {
        const content = `
            <h1>Conexão concluída</h1>
            <p>Sua conta foi conectada com sucesso. Agora o NorthWay pode acessar os recursos autorizados.</p>
            <div class="info-box">
                <span class="info-label">Página Facebook</span>
                <span class="info-value">${data.pageName}</span>
                <span class="info-label" style="margin-top: 12px;">ID da Página</span>
                <span class="info-value">${data.pageId}</span>
                ${data.igAccountId ? `
                    <span class="info-label" style="margin-top: 12px;">ID Instagram Business</span>
                    <span class="info-value">${data.igAccountId}</span>
                ` : ''}
            </div>
            <a href="/integrations/meta" class="btn">Conectar outra conta</a>
            <a href="/integrations/meta" class="btn btn-secondary">Voltar</a>
        `;
        return this.getLayout('Conectado', content);
    }

    renderErrorPage(reason: string, details?: string): string {
        let title = 'Não foi possível conectar';
        let message = 'Algo saiu do previsto. Tente novamente.';

        switch (reason) {
            case 'missing_env':
                message = 'Configuração incompleta no servidor. Avise o suporte.';
                break;
            case 'denied':
                message = 'Permissão não concedida. Sem autorização, não conseguimos concluir a conexão.';
                break;
            case 'invalid_redirect':
                message = 'Redirect URI não permitido. Ajuste no painel do Meta.';
                break;
            case 'invalid_state':
                message = 'Sessão expirada ou inválida. Tente iniciar a conexão novamente.';
                break;
            case 'no_pages':
                message = 'Nenhuma página encontrada para autorização.';
                break;
        }

        const content = `
            <h1>${title}</h1>
            <p>${message}</p>
            <div style="font-size: 11px; color: #444; margin: 20px 0;">DEBUG: ${reason} ${details || ''}</div>
            <a href="/integrations/meta" class="btn">Tentar novamente</a>
            <p style="margin-top: 20px; font-size: 14px;">Fale com o suporte</p>
        `;
        return this.getLayout('Falha', content);
    }
}
