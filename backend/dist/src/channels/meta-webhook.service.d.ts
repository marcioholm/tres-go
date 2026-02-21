import { PrismaService } from '../prisma/prisma.service';
export declare class MetaWebhookService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateSignature(body: any, signature: string): boolean;
    processWebhook(body: any): Promise<void>;
    private handleIncomingMessage;
    private handleWhatsAppWebhook;
    private handleMessageRead;
    private handleMessageDelivery;
}
