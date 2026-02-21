import { Response, Request } from 'express';
import { MetaWebhookService } from './meta-webhook.service';
export declare class MetaWebhookController {
    private readonly webhookService;
    constructor(webhookService: MetaWebhookService);
    verifyWebhook(mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    receiveMessage(body: any, req: Request): Promise<{
        ok: boolean;
    }>;
}
