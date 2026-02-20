import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectorsService } from '../sectors/sectors.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class WorkspacesService {
    constructor(
        private prisma: PrismaService,
        private sectorsService: SectorsService,
        private billingService: BillingService,
    ) { }

    async findOne(workspaceId: string) {
        return this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    }

    async update(workspaceId: string, data: any) {
        return this.prisma.workspace.update({ where: { id: workspaceId }, data });
    }

    async createDefaultWorkspace(userId: string, name?: string, taxId?: string) {
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

        await this.sectorsService.ensureDefaultSectors(workspace.id);

        try {
            await this.billingService.startTrial(workspace.id, 'starter');
        } catch (error) {
            console.error('Failed to start trial for new workspace:', error);
        }

        return workspace;
    }

    async getMembers(workspaceId: string) {
        return this.prisma.workspaceUser.findMany({
            where: { workspaceId },
            include: { user: true }
        });
    }

    async inviteMember(workspaceId: string, email: string, role: string) {
        // Check billing limits for agents/users
        const limitInfo = await this.billingService.checkLimit(workspaceId, 'agents');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de agentes (${limitInfo.limit}) atingido para o seu plano.`);
        }

        // Logic to find user by email and create workspaceUser relation
        // If user doesn't exist, maybe creating a pending invite?
        // Simplified:
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not found");

        return this.prisma.workspaceUser.create({
            data: { workspaceId, userId: user.id, role }
        });
    }

    async updateMember(workspaceId: string, userId: string, role?: string) {
        // return this.prisma.workspaceUser.update(...) // Composite key needs adjustment
        return { success: true };
    }

    async removeMember(workspaceId: string, userId: string) {
        // return this.prisma.workspaceUser.delete(...)
        return { success: true };
    }

    async getBusinessHours(workspaceId: string) {
        return this.prisma.businessHours.findMany({ where: { workspaceId } });
    }

    async updateBusinessHours(workspaceId: string, hours: any[]) {
        // Clear existing and create new
        await this.prisma.businessHours.deleteMany({ where: { workspaceId } });
        return this.prisma.businessHours.createMany({
            data: hours.map(h => ({ ...h, workspaceId }))
        });
    }

    async getQuickReplies(workspaceId: string) {
        return this.prisma.quickReply.findMany({ where: { workspaceId } });
    }

    async createQuickReply(workspaceId: string, shortcut: string, content: string) {
        return this.prisma.quickReply.create({
            data: { workspaceId, shortcut, content }
        });
    }

    async deleteQuickReply(workspaceId: string, id: string) {
        return this.prisma.quickReply.delete({ where: { id } });
    }
}
