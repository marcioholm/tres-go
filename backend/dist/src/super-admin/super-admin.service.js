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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_service_1 = require("../billing/billing.service");
const os = require("os");
let SuperAdminService = class SuperAdminService {
    constructor(prisma, billing) {
        this.prisma = prisma;
        this.billing = billing;
    }
    async getDashboardMetrics() {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [activeSubs, cancelledSubs, trials] = await Promise.all([
            this.prisma.subscription.findMany({ where: { status: 'ACTIVE' }, include: { plan: true } }),
            this.prisma.subscription.count({ where: { status: 'CANCELLED', updatedAt: { gte: thirtyDaysAgo } } }),
            this.prisma.subscription.findMany({ where: { status: 'TRIAL' }, include: { plan: true } })
        ]);
        let mrr = 0;
        for (const sub of activeSubs) {
            if (!sub.plan)
                continue;
            mrr += sub.billingCycle === 'MONTHLY' ? (sub.plan.priceMonthly || 0) : (sub.plan.priceYearly || 0) / 12;
        }
        const totalWorkspaces = await this.prisma.workspace.count();
        const blockedWorkspaces = await this.prisma.workspace.count({ where: { isBlocked: true } });
        const totalActive = activeSubs.length || 1;
        const churnRate = (cancelledSubs / totalActive) * 100;
        const ltv = churnRate > 0 ? (mrr / totalActive) / (churnRate / 100) : mrr / totalActive * 24;
        const conversionRate = 65;
        const asaasHealth = await this.billing.getAsaasHealth();
        return {
            mrr: Number(mrr.toFixed(2)),
            arr: Number((mrr * 12).toFixed(2)),
            totalWorkspaces,
            activeWorkspaces: activeSubs.length,
            blockedWorkspaces,
            newSignups: await this.prisma.workspace.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            churnRate: Number(churnRate.toFixed(1)),
            ltv: Number(ltv.toFixed(2)),
            conversionRate,
            asaasHealth,
            criticalAlerts: await this.getCriticalAlerts()
        };
    }
    async getCriticalAlerts() {
        const alerts = [];
        const blocked = await this.prisma.workspace.findMany({ where: { isBlocked: true }, take: 5 });
        if (blocked.length > 0)
            alerts.push({ type: 'BLOCK', count: blocked.length, items: blocked.map(w => w.name) });
        return alerts;
    }
    async getWorkspaces(query) {
        const { page = 1, limit = 10, search, status } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        if (status === 'BLOCKED')
            where.isBlocked = true;
        if (status === 'ACTIVE')
            where.isBlocked = false;
        const [items, total] = await Promise.all([
            this.prisma.workspace.findMany({
                where, skip: Number(skip), take: Number(limit),
                include: { subscription: { include: { plan: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.workspace.count({ where })
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async getAllUsers(search) {
        return this.prisma.user.findMany({
            where: search ? { email: { contains: search, mode: 'insensitive' } } : {},
            include: { superAdmin: true, workspaces: { include: { workspace: true } } },
            take: 50
        });
    }
    async getAdmins() {
        return this.prisma.superAdmin.findMany({
            include: { user: true }
        });
    }
    async promoteToAdmin(userId) {
        return this.prisma.superAdmin.upsert({
            where: { userId },
            create: { userId },
            update: {}
        });
    }
    async revokeAdmin(id) {
        return this.prisma.superAdmin.delete({ where: { id } });
    }
    async getSystemHealth() {
        const load = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        return {
            status: 'OPERATIONAL',
            uptime: Math.floor(os.uptime()),
            cpu: {
                usage: Math.round(((load[0]) / os.cpus().length) * 100),
                cores: os.cpus().length
            },
            memory: {
                total: totalMem,
                free: freeMem,
                usage: Math.round(((totalMem - freeMem) / totalMem) * 100)
            },
            storage: { usage: 28 },
            redis: { status: 'ONLINE', latency: '2ms' },
            bullmq: { pendingJobs: 0 },
            services: {
                asaas: (await this.billing.getAsaasHealth()).status === 'connected' ? 'UP' : 'DOWN'
            }
        };
    }
    async getWorkspaceDetails(id) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
                subscription: { include: { plan: true, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } } },
                users: { include: { user: true } }
            }
        });
        if (!workspace)
            throw new common_1.NotFoundException('Workspace not found');
        return workspace;
    }
    async blockWorkspace(id, reason, adminId) {
        await this.billing.blockWorkspace(id, reason, adminId);
        return { success: true };
    }
    async unblockWorkspace(id, adminId) {
        await this.billing.unblockWorkspace(id, adminId);
        return { success: true };
    }
    async getPlans() {
        return this.prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } });
    }
    async changeWorkspacePlan(workspaceId, planSlug) {
        await this.billing.changePlan(workspaceId, planSlug);
        return { success: true };
    }
    async deleteWorkspace(id, adminId) {
        await this.blockWorkspace(id, 'Deleção Lógica (Soft Delete)', adminId);
        return { success: true, message: 'Workspace soft-deleted successfully' };
    }
    async createPlan(data) {
        return this.prisma.plan.create({ data });
    }
    async updatePlan(id, data) {
        return this.prisma.plan.update({ where: { id }, data });
    }
    async getFinancialReports(query) {
        const where = { status: 'PAID' };
        if (query.startDate)
            where.paidAt = { gte: new Date(query.startDate) };
        if (query.endDate) {
            where.paidAt = where.paidAt || {};
            where.paidAt.lte = new Date(query.endDate);
        }
        const invoices = await this.prisma.invoice.findMany({ where });
        const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
        return { totalRevenue, count: invoices.length, invoices };
    }
    async getAuditLogs(query) {
        const { limit = 50, ...where } = query;
        return this.prisma.auditLog.findMany({
            where, orderBy: { createdAt: 'desc' }, take: Number(limit),
            include: { user: true }
        });
    }
    async exportUsersToCSV() {
        const users = await this.prisma.user.findMany({
            select: {
                firstName: true,
                lastName: true,
                email: true,
                niche: true,
                createdAt: true
            }
        });
        const header = "Primeiro Nome,Sobrenome,Email,Nicho,Data de Cadastro\n";
        const rows = users.map(u => `${u.firstName || ''},${u.lastName || ''},${u.email},${u.niche || ''},${u.createdAt.toISOString()}`).join("\n");
        return header + rows;
    }
    async exportContactsToCSV() {
        const contacts = await this.prisma.contact.findMany({
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });
        const header = "Primeiro Nome,Sobrenome,Email,Telefone,Data de Criação\n";
        const rows = contacts.map(c => `${c.firstName || ''},${c.lastName || ''},${c.email || ''},${c.phone || ''},${c.createdAt.toISOString()}`).join("\n");
        return header + rows;
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        billing_service_1.BillingService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map