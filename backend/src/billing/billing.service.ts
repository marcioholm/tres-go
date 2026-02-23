import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private asaas: AsaasService,
    private gateway: AppGateway,
  ) { }

  // ── Ativar trial ────────────────────────────────────────────────────────────

  async startTrial(workspaceId: string, planSlug = 'starter') {
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
          maxChannels: 10,
          maxConversationsPerMonth: 1000,
          maxSectors: 3,
          maxCampaigns: 5,
          hasKanban: true,
          hasReports: true,
          hasChatbot: true,
        },
      });
    }

    if (!plan) throw new Error(`Plano '${planSlug}' não encontrado.`);

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
    } catch (error) {
      console.error(
        `[Billing] Falha ao criar assinatura de Trial para workspace ${workspaceId}:`,
        error.message || error,
      );
      throw error;
    }
  }

  // ── Ativar assinatura paga ───────────────────────────────────────────────────

  async activateSubscription(
    workspaceId: string,
    data: {
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
    },
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { slug: data.planSlug },
    });
    if (!plan) throw new Error(`Plano '${data.planSlug}' não encontrado.`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    // 1. Criar/buscar cliente no Asaas
    let asaasCustomerId = subscription?.asaasCustomerId;
    if (!asaasCustomerId) {
      const customer = await this.asaas.createCustomer(data.customerData);
      asaasCustomerId = customer.id;
    }

    // 2. Calcular valor
    const value =
      data.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1); // Vencimento padrão

    // 3. Criar assinatura no Asaas
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

    // 4. Atualizar no banco
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

  // ── Mudar plano ──────────────────────────────────────────────────────────────

  async changePlan(workspaceId: string, newPlanSlug: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { slug: newPlanSlug },
    });
    if (!plan) throw new Error(`Plano '${newPlanSlug}' não encontrado.`);

    const sub = await this.prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });

    // Atualizar no Asaas se tiver assinatura ativa
    if (sub?.asaasSubscriptionId) {
      const value =
        sub.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
      await this.asaas.updateSubscription(sub.asaasSubscriptionId, { value });
    }

    return this.prisma.subscription.update({
      where: { workspaceId },
      data: { planId: plan.id },
    });
  }

  // ── Cancelar assinatura ──────────────────────────────────────────────────────

  async cancelSubscription(workspaceId: string, reason?: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (sub?.asaasSubscriptionId) {
      await this.asaas.cancelSubscription(sub.asaasSubscriptionId);
    }

    await this.prisma.subscription.update({
      where: { workspaceId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    await this.logAudit(workspaceId, 'subscription.cancelled', null, {
      reason,
    });
  }

  // ── BLOQUEAR workspace (inadimplência ou manual) ──────────────────────────

  async blockWorkspace(
    workspaceId: string,
    reason: string,
    blockedBy?: string,
  ) {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { isBlocked: true, blockReason: reason },
    });

    const sub = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });
    if (sub) {
      await this.prisma.subscription.update({
        where: { workspaceId },
        data: { status: 'BLOCKED', blockedAt: new Date() },
      });
    }

    // Desconectar todos os agentes via WebSocket
    this.gateway.server.to(workspaceId).emit('workspace_blocked', {
      reason,
      message: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
    });

    await this.logAudit(workspaceId, 'workspace.blocked', workspaceId, {
      reason,
      blockedBy,
    });
  }

  // ── Desbloquear workspace ────────────────────────────────────────────────────

  async unblockWorkspace(workspaceId: string, unblockedBy: string) {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { isBlocked: false, blockReason: null },
    });

    const sub = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });
    if (sub) {
      await this.prisma.subscription.update({
        where: { workspaceId },
        data: { status: 'ACTIVE', blockedAt: null },
      });
    }

    await this.logAudit(workspaceId, 'workspace.unblocked', workspaceId, {
      unblockedBy,
    });
  }

  // ── Verificar limites do plano ───────────────────────────────────────────────

  async checkLimit(
    workspaceId: string,
    resource: 'agents' | 'channels' | 'conversations' | 'campaigns' | 'sectors',
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    upgradeRequired: boolean;
  }> {
    const sub = await this.prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });

    // If no subscription/plan found, allow with a generous fallback (e.g. newly created workspace)
    if (!sub || !sub.plan) {
      let current = 0;
      if (resource === 'channels') {
        current = await this.prisma.channel.count({ where: { workspaceId, status: 'ACTIVE' } });
      } else if (resource === 'agents') {
        current = await this.prisma.workspaceUser.count({ where: { workspaceId } });
      }
      const defaultLimit = 10;
      return { allowed: current < defaultLimit, current, limit: defaultLimit, upgradeRequired: false };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let current = 0;
    let limit = 0;

    switch (resource) {
      case 'agents':
        current = await this.prisma.workspaceUser.count({
          where: { workspaceId },
        }); // Active flag might not exist on workspaceUser natively
        limit = sub.plan.maxAgents;
        break;
      case 'channels':
        current = await this.prisma.channel.count({
          where: { workspaceId, status: 'ACTIVE' },
        });
        limit = sub.plan.maxChannels;
        break;
      case 'conversations':
        current = await this.prisma.conversation.count({
          where: { workspaceId, createdAt: { gte: startOfMonth } },
        });
        limit = sub.plan.maxConversationsPerMonth;
        break;
      case 'sectors':
        current = await this.prisma.sector.count({
          where: { workspaceId, isActive: true },
        });
        limit = sub.plan.maxSectors;
        break;
      case 'campaigns':
        current = await this.prisma.campaign.count({
          where: { workspaceId, createdAt: { gte: startOfMonth } },
        });
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

  private async logAudit(
    workspaceId: string,
    action: string,
    target: string | null,
    metadata: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        actionType: action,
        target,
        metadata,
        entityType: 'Subscription',
        entityId: target || 'System',
      },
    });
  }

  async getAsaasHealth() {
    return this.asaas.checkHealth();
  }
}
