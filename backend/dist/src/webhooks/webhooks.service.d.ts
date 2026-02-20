import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class WebhooksService {
    private prisma;
    private conversationsService;
    private gateway;
    constructor(prisma: PrismaService, conversationsService: ConversationsService, gateway: AppGateway);
    verifyWhatsapp(mode: string, token: string): boolean;
    processWhatsappMessage(workspaceId: string, body: any): Promise<void>;
}
