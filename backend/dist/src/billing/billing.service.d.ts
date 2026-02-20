import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class BillingService {
    private prisma;
    private asaas;
    private gateway;
    constructor(prisma: PrismaService, asaas: AsaasService, gateway: AppGateway);
    startTrial(workspaceId: string, planSlug?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        asaasCustomerId: string | null;
        asaasSubscriptionId: string | null;
        trialEndsAt: Date | null;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelledAt: Date | null;
        blockedAt: Date | null;
        priceOverride: number | null;
        discountPercent: number | null;
        workspaceId: string;
        planId: string;
    }>;
    activateSubscription(workspaceId: string, data: {
        planSlug: string;
        billingCycle: 'MONTHLY' | 'YEARLY';
        billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
        customerData: {
            name: string;
            email: string;
            cpfCnpj: string;
            phone?: string;
            postalCode?: string;
        };
        creditCard?: any;
        creditCardHolderInfo?: any;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        asaasCustomerId: string | null;
        asaasSubscriptionId: string | null;
        trialEndsAt: Date | null;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelledAt: Date | null;
        blockedAt: Date | null;
        priceOverride: number | null;
        discountPercent: number | null;
        workspaceId: string;
        planId: string;
    }>;
    changePlan(workspaceId: string, newPlanSlug: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        asaasCustomerId: string | null;
        asaasSubscriptionId: string | null;
        trialEndsAt: Date | null;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelledAt: Date | null;
        blockedAt: Date | null;
        priceOverride: number | null;
        discountPercent: number | null;
        workspaceId: string;
        planId: string;
    }>;
    cancelSubscription(workspaceId: string, reason?: string): Promise<void>;
    blockWorkspace(workspaceId: string, reason: string, blockedBy?: string): Promise<void>;
    unblockWorkspace(workspaceId: string, unblockedBy: string): Promise<void>;
    checkLimit(workspaceId: string, resource: 'agents' | 'channels' | 'conversations' | 'campaigns' | 'sectors'): Promise<{
        allowed: boolean;
        current: number;
        limit: number;
        upgradeRequired: boolean;
    }>;
    private logAudit;
    getAsaasHealth(): Promise<{
        status: string;
        baseUrl: string;
        environment: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        baseUrl?: undefined;
        environment?: undefined;
    }>;
}
