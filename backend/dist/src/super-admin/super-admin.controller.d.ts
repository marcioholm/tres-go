import { SuperAdminService } from './super-admin.service';
export declare class SuperAdminController {
    private superAdminService;
    constructor(superAdminService: SuperAdminService);
    getDashboard(): Promise<{
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
    getWorkspaces(query: any): Promise<{
        items: ({
            subscription: {
                plan: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
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
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.SubscriptionStatus;
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
            taxId: string | null;
            isBlocked: boolean;
            blockReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getWorkspaceDetails(id: string): Promise<{
        subscription: {
            plan: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
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
                createdAt: Date;
                updatedAt: Date;
            };
            invoices: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.InvoiceStatus;
                asaasPaymentId: string | null;
                subscriptionId: string;
                amount: number;
                dueDate: Date;
                paidAt: Date | null;
                paymentMethod: string | null;
                invoiceUrl: string | null;
                pixQrCode: string | null;
                pixCopiaECola: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
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
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string | null;
                lastName: string | null;
                niche: string | null;
                password: string;
                status: string;
            };
        } & {
            id: string;
            userId: string;
            workspaceId: string;
            role: string;
        })[];
    } & {
        plan: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        taxId: string | null;
        isBlocked: boolean;
        blockReason: string | null;
    }>;
    blockWorkspace(id: string, reason: string, req: any): Promise<{
        success: boolean;
    }>;
    unblockWorkspace(id: string, req: any): Promise<{
        success: boolean;
    }>;
    changeWorkspacePlan(id: string, planSlug: string): Promise<{
        success: boolean;
    }>;
    deleteWorkspace(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPlans(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createPlan(data: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePlan(id: string, data: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllUsers(search: string): Promise<({
        workspaces: ({
            workspace: {
                plan: string;
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                taxId: string | null;
                isBlocked: boolean;
                blockReason: string | null;
            };
        } & {
            id: string;
            userId: string;
            workspaceId: string;
            role: string;
        })[];
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
    })[]>;
    getHealth(): Promise<{
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
    getAdmins(): Promise<({
        user: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string | null;
            lastName: string | null;
            niche: string | null;
            password: string;
            status: string;
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
    getFinancialReports(query: any): Promise<{
        totalRevenue: number;
        count: number;
        invoices: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            asaasPaymentId: string | null;
            subscriptionId: string;
            amount: number;
            dueDate: Date;
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
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string | null;
            lastName: string | null;
            niche: string | null;
            password: string;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        workspaceId: string | null;
        actionType: string;
        entityType: string | null;
        entityId: string | null;
        target: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    exportUsers(res: any): Promise<any>;
    exportContacts(res: any): Promise<any>;
}
