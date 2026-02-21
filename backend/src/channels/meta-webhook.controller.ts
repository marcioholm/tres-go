import { Controller, Get, Post, Body, Query, Res, Req, HttpCode } from '@nestjs/common';
import { Response, Request } from 'express';
import { MetaWebhookService } from './meta-webhook.service';

@Controller('webhooks/meta')
export class MetaWebhookController {
    constructor(private readonly webhookService: MetaWebhookService) { }

    // Verificação do webhook (GET) — Meta chama isso ao registrar
    @Get()
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        }
        return res.status(403).send('Forbidden');
    }

    // Receber mensagens (POST) — Meta envia cada mensagem aqui
    @Post()
    @HttpCode(200) // SEMPRE retornar 200 para a Meta
    async receiveMessage(@Body() body: any, @Req() req: any) {
        // Validar assinatura HMAC usando o rawBody preservado pelo NestJS
        const signature = req.headers['x-hub-signature-256'] as string;
        const rawBody = req.rawBody;

        if (!rawBody || !this.webhookService.validateSignature(rawBody, signature)) {
            console.warn('[Meta Webhook] Invalid webhook signature or missing rawBody');
            return { ok: true };
        }

        // Processar de forma assíncrona
        setImmediate(() => this.webhookService.processWebhook(body));

        return { ok: true };
    }
}
