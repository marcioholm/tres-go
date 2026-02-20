import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class BillingWebhookController {
    private billing;
    private prisma;
    private asaas;
    private gateway;
    private readonly logger;
    constructor(billing: BillingService, prisma: PrismaService, asaas: AsaasService, gateway: AppGateway);
    handleAsaasWebhook(payload: any, token: string): Promise<{
        received: boolean;
    }>;
    private addMonth;
}
