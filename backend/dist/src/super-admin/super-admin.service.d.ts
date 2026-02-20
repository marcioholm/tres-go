import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
export declare class SuperAdminService {
    private prisma;
    private billing;
    constructor(prisma: PrismaService, billing: BillingService);
    getDashboardMetrics(): Promise<{
        mrr: number;
        arr: number;
        totalWorkspaces: number;
        activeWorkspaces: number;
        blockedWorkspaces: number;
        newSignups: number;
        churnRate: number;
        ltv: number;
        conversionRate: number;
        asaasHealth: {
            status: string;
            baseUrl: string;
            environment: string;
            error?: undefined;
        } | {
            status: string;
            error: any;
            baseUrl?: undefined;
            environment?: undefined;
        };
        criticalAlerts: any[];
    }>;
    private getCriticalAlerts;
    getWorkspaces(query: any): Promise<{
        items: ({
            subscription: {
                plan: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    slug: string;
                    priceMonthly: number;
                    priceYearly: number;
                    isActive: boolean;
                    isPublic: boolean;
                    trialDays: number;
                    maxAgents: number;
                    maxChannels: number;
                    maxConversationsPerMonth: number;
                    maxCampaigns: number;
                    maxStorage: number;
                    maxSectors: number;
                    hasKanban: boolean;
                    hasChatbot: boolean;
                    hasAI: boolean;
                    hasReports: boolean;
                    hasAPI: boolean;
                    hasWhiteLabel: boolean;
                    hasMultiSectors: boolean;
                    hasCampaigns: boolean;
                    hasSalesHistory: boolean;
                    hasScheduledMessages: boolean;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.SubscriptionStatus;
                createdAt: Date;
                updatedAt: Date;
                workspaceId: string;
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
                planId: string;
            };
        } & {
            plan: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isBlocked: boolean;
            blockReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAllUsers(search?: string): Promise<({
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
        workspaces: ({
            workspace: {
                plan: string;
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                blockReason: string | null;
            };
        } & {
            id: string;
            workspaceId: string;
            userId: string;
            role: string;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAdmins(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            password: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
    })[]>;
    promoteToAdmin(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    revokeAdmin(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    getSystemHealth(): Promise<{
        status: string;
        uptime: number;
        cpu: {
            usage: number;
            cores: number;
        };
        memory: {
            total: number;
            free: number;
            usage: number;
        };
        storage: {
            usage: number;
        };
        redis: {
            status: string;
            latency: string;
        };
        bullmq: {
            pendingJobs: number;
        };
        services: {
            asaas: string;
        };
    }>;
    getWorkspaceDetails(id: string): Promise<{
        subscription: {
            plan: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                slug: string;
                priceMonthly: number;
                priceYearly: number;
                isActive: boolean;
                isPublic: boolean;
                trialDays: number;
                maxAgents: number;
                maxChannels: number;
                maxConversationsPerMonth: number;
                maxCampaigns: number;
                maxStorage: number;
                maxSectors: number;
                hasKanban: boolean;
                hasChatbot: boolean;
                hasAI: boolean;
                hasReports: boolean;
                hasAPI: boolean;
                hasWhiteLabel: boolean;
                hasMultiSectors: boolean;
                hasCampaigns: boolean;
                hasSalesHistory: boolean;
                hasScheduledMessages: boolean;
            };
            invoices: {
                id: string;
                status: import(".prisma/client").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                dueDate: Date;
                description: string | null;
                asaasPaymentId: string | null;
                subscriptionId: string;
                amount: number;
                paidAt: Date | null;
                paymentMethod: string | null;
                invoiceUrl: string | null;
                pixQrCode: string | null;
                pixCopiaECola: string | null;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
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
            planId: string;
        };
        users: ({
            user: {
                id: string;
                email: string;
                name: string;
                password: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            workspaceId: string;
            userId: string;
            role: string;
        })[];
    } & {
        plan: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    blockWorkspace(id: string, reason: string, adminId: string): Promise<{
        success: boolean;
    }>;
    unblockWorkspace(id: string, adminId: string): Promise<{
        success: boolean;
    }>;
    getPlans(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        priceMonthly: number;
        priceYearly: number;
        isActive: boolean;
        isPublic: boolean;
        trialDays: number;
        maxAgents: number;
        maxChannels: number;
        maxConversationsPerMonth: number;
        maxCampaigns: number;
        maxStorage: number;
        maxSectors: number;
        hasKanban: boolean;
        hasChatbot: boolean;
        hasAI: boolean;
        hasReports: boolean;
        hasAPI: boolean;
        hasWhiteLabel: boolean;
        hasMultiSectors: boolean;
        hasCampaigns: boolean;
        hasSalesHistory: boolean;
        hasScheduledMessages: boolean;
    }[]>;
    changeWorkspacePlan(workspaceId: string, planSlug: string): Promise<{
        success: boolean;
    }>;
    deleteWorkspace(id: string, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createPlan(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        priceMonthly: number;
        priceYearly: number;
        isActive: boolean;
        isPublic: boolean;
        trialDays: number;
        maxAgents: number;
        maxChannels: number;
        maxConversationsPerMonth: number;
        maxCampaigns: number;
        maxStorage: number;
        maxSectors: number;
        hasKanban: boolean;
        hasChatbot: boolean;
        hasAI: boolean;
        hasReports: boolean;
        hasAPI: boolean;
        hasWhiteLabel: boolean;
        hasMultiSectors: boolean;
        hasCampaigns: boolean;
        hasSalesHistory: boolean;
        hasScheduledMessages: boolean;
    }>;
    updatePlan(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        priceMonthly: number;
        priceYearly: number;
        isActive: boolean;
        isPublic: boolean;
        trialDays: number;
        maxAgents: number;
        maxChannels: number;
        maxConversationsPerMonth: number;
        maxCampaigns: number;
        maxStorage: number;
        maxSectors: number;
        hasKanban: boolean;
        hasChatbot: boolean;
        hasAI: boolean;
        hasReports: boolean;
        hasAPI: boolean;
        hasWhiteLabel: boolean;
        hasMultiSectors: boolean;
        hasCampaigns: boolean;
        hasSalesHistory: boolean;
        hasScheduledMessages: boolean;
    }>;
    getFinancialReports(query: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalRevenue: number;
        count: number;
        invoices: {
            id: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            dueDate: Date;
            description: string | null;
            asaasPaymentId: string | null;
            subscriptionId: string;
            amount: number;
            paidAt: Date | null;
            paymentMethod: string | null;
            invoiceUrl: string | null;
            pixQrCode: string | null;
            pixCopiaECola: string | null;
        }[];
    }>;
    getAuditLogs(query: any): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            password: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        workspaceId: string | null;
        actionType: string;
        entityType: string | null;
        entityId: string | null;
        target: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string | null;
    })[]>;
}
