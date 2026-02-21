"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const asaas_service_1 = require("./asaas.service");
const app_gateway_1 = require("../gateway/app.gateway");
let BillingService = class BillingService {
    constructor(prisma, asaas, gateway) {
        this.prisma = prisma;
        this.asaas = asaas;
        this.gateway = gateway;
    }
    async startTrial(workspaceId, planSlug = 'starter') {
        let plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
        if (!plan && planSlug === 'starter') {
            plan = await this.prisma.plan.create({
                data: {
                    name: 'Starter',
                    slug: 'starter',
                    priceMonthly: 97,
                    priceYearly: 890,
                    trialDays: 7,
                    maxAgents: 3,
                    maxChannels: 2,
                    maxConversationsPerMonth: 1000,
                    maxSectors: 3,
                    maxCampaigns: 5,
                    hasKanban: true,
                    hasReports: true,
                    hasChatbot: true
                }
            });
        }
        if (!plan)
            throw new Error(`Plano '${planSlug}' não encontrado.`);
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);
        try {
            return await this.prisma.subscription.create({
                data: {
                    workspaceId,
                    planId: plan.id,
                    status: 'TRIAL',
                    trialEndsAt,
                },
            });
        }
        catch (error) {
            console.error(`[Billing] Falha ao criar assinatura de Trial para workspace ${workspaceId}:`, error.message || error);
            throw error;
        }
    }
    async activateSubscription(workspaceId, data) {
        const plan = await this.prisma.plan.findUnique({ where: { slug: data.planSlug } });
        if (!plan)
            throw new Error(`Plano '${data.planSlug}' não encontrado.`);
        const subscription = await this.prisma.subscription.findUnique({ where: { workspaceId } });
        let asaasCustomerId = subscription?.asaasCustomerId;
        if (!asaasCustomerId) {
            const customer = await this.asaas.createCustomer(data.customerData);
            asaasCustomerId = customer.id;
        }
        const value = data.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        const asaasSub = await this.asaas.createSubscription({
            asaasCustomerId,
            value,
            cycle: data.billingCycle,
            description: `Northway Omni — Plano ${plan.name}`,
            billingType: data.billingType,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
            creditCard: data.creditCard,
            creditCardHolderInfo: data.creditCardHolderInfo,
        });
        return this.prisma.subscription.upsert({
            where: { workspaceId },
            create: {
                workspaceId,
                planId: plan.id,
                status: 'ACTIVE',
                billingCycle: data.billingCycle,
                asaasCustomerId,
                asaasSubscriptionId: asaasSub.id,
                currentPeriodStart: new Date(),
            },
            update: {
                planId: plan.id,
                status: 'ACTIVE',
                billingCycle: data.billingCycle,
                asaasCustomerId,
                asaasSubscriptionId: asaasSub.id,
                currentPeriodStart: new Date(),
                cancelledAt: null,
                blockedAt: null,
            },
        });
    }
    async changePlan(workspaceId, newPlanSlug) {
        const plan = await this.prisma.plan.findUnique({ where: { slug: newPlanSlug } });
        if (!plan)
            throw new Error(`Plano '${newPlanSlug}' não encontrado.`);
        const sub = await this.prisma.subscription.findUnique({
            where: { workspaceId },
            include: { plan: true },
        });
        if (sub?.asaasSubscriptionId) {
            const value = sub.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
            await this.asaas.updateSubscription(sub.asaasSubscriptionId, { value });
        }
        return this.prisma.subscription.update({
            where: { workspaceId },
            data: { planId: plan.id },
        });
    }
    async cancelSubscription(workspaceId, reason) {
        const sub = await this.prisma.subscription.findUnique({ where: { workspaceId } });
        if (sub?.asaasSubscriptionId) {
            await this.asaas.cancelSubscription(sub.asaasSubscriptionId);
        }
        await this.prisma.subscription.update({
            where: { workspaceId },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        await this.logAudit(workspaceId, 'subscription.cancelled', null, { reason });
    }
    async blockWorkspace(workspaceId, reason, blockedBy) {
        await this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { isBlocked: true, blockReason: reason },
        });
        const sub = await this.prisma.subscription.findUnique({ where: { workspaceId } });
        if (sub) {
            await this.prisma.subscription.update({
                where: { workspaceId },
                data: { status: 'BLOCKED', blockedAt: new Date() },
            });
        }
        this.gateway.server.to(workspaceId).emit('workspace_blocked', {
            reason,
            message: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
        });
        await this.logAudit(workspaceId, 'workspace.blocked', workspaceId, { reason, blockedBy });
    }
    async unblockWorkspace(workspaceId, unblockedBy) {
        await this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { isBlocked: false, blockReason: null },
        });
        const sub = await this.prisma.subscription.findUnique({ where: { workspaceId } });
        if (sub) {
            await this.prisma.subscription.update({
                where: { workspaceId },
                data: { status: 'ACTIVE', blockedAt: null },
            });
        }
        await this.logAudit(workspaceId, 'workspace.unblocked', workspaceId, { unblockedBy });
    }
    async checkLimit(workspaceId, resource) {
        const sub = await this.prisma.subscription.findUnique({
            where: { workspaceId },
            include: { plan: true },
        });
        if (!sub || !sub.plan)
            return { allowed: false, current: 0, limit: 0, upgradeRequired: true };
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let current = 0;
        let limit = 0;
        switch (resource) {
            case 'agents':
                current = await this.prisma.workspaceUser.count({ where: { workspaceId } });
                limit = sub.plan.maxAgents;
                break;
            case 'channels':
                current = await this.prisma.channel.count({ where: { workspaceId, status: 'ACTIVE' } });
                limit = sub.plan.maxChannels;
                break;
            case 'conversations':
                current = await this.prisma.conversation.count({
                    where: { workspaceId, createdAt: { gte: startOfMonth } },
                });
                limit = sub.plan.maxConversationsPerMonth;
                break;
            case 'sectors':
                current = await this.prisma.sector.count({ where: { workspaceId, isActive: true } });
                limit = sub.plan.maxSectors;
                break;
            case 'campaigns':
                current = await this.prisma.campaign.count({ where: { workspaceId, createdAt: { gte: startOfMonth } } });
                limit = sub.plan.maxCampaigns;
                break;
        }
        return {
            allowed: current < limit,
            current,
            limit,
            upgradeRequired: current >= limit,
        };
    }
    async logAudit(workspaceId, action, target, metadata) {
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                actionType: action,
                target,
                metadata,
                entityType: 'Subscription',
                entityId: target || 'System'
            }
        });
    }
    async getAsaasHealth() {
        return this.asaas.checkHealth();
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        asaas_service_1.AsaasService,
        app_gateway_1.AppGateway])
], BillingService);
//# sourceMappingURL=billing.service.js.map