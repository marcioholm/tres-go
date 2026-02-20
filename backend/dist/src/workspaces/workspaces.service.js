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
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sectors_service_1 = require("../sectors/sectors.service");
const billing_service_1 = require("../billing/billing.service");
let WorkspacesService = class WorkspacesService {
    constructor(prisma, sectorsService, billingService) {
        this.prisma = prisma;
        this.sectorsService = sectorsService;
        this.billingService = billingService;
    }
    async findOne(workspaceId) {
        return this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    }
    async update(workspaceId, data) {
        return this.prisma.workspace.update({ where: { id: workspaceId }, data });
    }
    async createDefaultWorkspace(userId, name, taxId) {
        const workspace = await this.prisma.workspace.create({
            data: {
                name: name || 'Meu Workspace',
                taxId: taxId || null,
                plan: 'FREE',
                users: {
                    create: {
                        userId,
                        role: 'ADMIN'
                    }
                }
            }
        });
        try {
            await this.billingService.startTrial(workspace.id, 'starter');
        }
        catch (error) {
            console.error('Failed to start trial for new workspace:', error);
        }
        await this.sectorsService.ensureDefaultSectors(workspace.id);
        return workspace;
    }
    async getMembers(workspaceId) {
        return this.prisma.workspaceUser.findMany({
            where: { workspaceId },
            include: { user: true }
        });
    }
    async inviteMember(workspaceId, email, role) {
        const limitInfo = await this.billingService.checkLimit(workspaceId, 'agents');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de agentes (${limitInfo.limit}) atingido para o seu plano.`);
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User not found");
        return this.prisma.workspaceUser.create({
            data: { workspaceId, userId: user.id, role }
        });
    }
    async updateMember(workspaceId, userId, role) {
        return { success: true };
    }
    async removeMember(workspaceId, userId) {
        return { success: true };
    }
    async getBusinessHours(workspaceId) {
        return this.prisma.businessHours.findMany({ where: { workspaceId } });
    }
    async updateBusinessHours(workspaceId, hours) {
        await this.prisma.businessHours.deleteMany({ where: { workspaceId } });
        return this.prisma.businessHours.createMany({
            data: hours.map(h => ({ ...h, workspaceId }))
        });
    }
    async getQuickReplies(workspaceId) {
        return this.prisma.quickReply.findMany({ where: { workspaceId } });
    }
    async createQuickReply(workspaceId, shortcut, content) {
        return this.prisma.quickReply.create({
            data: { workspaceId, shortcut, content }
        });
    }
    async deleteQuickReply(workspaceId, id) {
        return this.prisma.quickReply.delete({ where: { id } });
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sectors_service_1.SectorsService,
        billing_service_1.BillingService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map