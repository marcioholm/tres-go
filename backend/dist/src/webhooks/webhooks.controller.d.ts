import { Response } from 'express';
import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    verifyWhatsapp(phoneNumberId: string, mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    handleWhatsappMessage(phoneNumberId: string, body: any, res: Response): Promise<Response<any, Record<string, any>>>;
    handleZapiMessage(instanceId: string, body: any, res: Response): Response<any, Record<string, any>>;
}
