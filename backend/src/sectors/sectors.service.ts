import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class SectorsService {
    constructor(
        private prisma: PrismaService,
        private billing: BillingService
    ) { }

    async findAll(workspaceId: string) {
        return this.prisma.sector.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { members: true, conversations: true }
                },
                slaConfig: true
            },
            orderBy: { order: 'asc' }
        });
    }

    async findOne(workspaceId: string, sectorId: string) {
        return this.prisma.sector.findUnique({
            where: { id: sectorId, workspaceId },
            include: {
                members: { include: { user: true } },
                slaConfig: true,
                autoRules: true,
                kanbanBoard: true,
                _count: {
                    select: { conversations: true }
                }
            }
        });
    }

    async create(workspaceId: string, data: any, options: { skipLimitCheck?: boolean } = {}) {
        // If setting as default, unset others
        if (data.isDefault) {
            await this.prisma.sector.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        // Check billing limits
        if (!options.skipLimitCheck) {
            const limitInfo = await this.billing.checkLimit(workspaceId, 'sectors');
            if (!limitInfo.allowed) {
                throw new Error(`Limite de setores (${limitInfo.limit}) atingido para o seu plano.`);
            }
        }

        // Create sector with default Kanban and SLA
        return this.prisma.sector.create({
            data: {
                ...data,
                workspaceId,
                kanbanBoard: {
                    create: {
                        workspaceId,
                        name: `Kanban - ${data.name}`,
                        columns: {
                            createMany: {
                                data: [
                                    { name: 'Novo Lead', order: 0, color: '#3b82f6' },
                                    { name: 'Contato', order: 1, color: '#eab308' },
                                    { name: 'Proposta', order: 2, color: '#a855f7' },
                                    { name: 'Negociação', order: 3, color: '#f97316' },
                                    { name: 'Ganho', order: 4, color: '#22c55e', isWon: true },
                                    { name: 'Perdido', order: 5, color: '#ef4444', isLost: true },
                                ]
                            }
                        }
                    }
                },
                slaConfig: {
                    create: {
                        firstResponseTime: 5,
                        resolutionTime: 120
                    }
                }
            },
            include: { kanbanBoard: true, slaConfig: true }
        });
    }

    async update(workspaceId: string, sectorId: string, data: any) {
        if (data.isDefault) {
            await this.prisma.sector.updateMany({
                where: { workspaceId, isDefault: true, id: { not: sectorId } },
                data: { isDefault: false }
            });
        }

        return this.prisma.sector.update({
            where: { id: sectorId, workspaceId },
            data
        });
    }

    async delete(workspaceId: string, sectorId: string) {
        // Check for open conversations
        const sector = await this.prisma.sector.findUnique({
            where: { id: sectorId },
            include: { _count: { select: { conversations: true } } }
        });

        if (sector._count.conversations > 0) {
            // Find default sector to move conversations to
            const defaultSector = await this.prisma.sector.findFirst({
                where: { workspaceId, isDefault: true, id: { not: sectorId } }
            });

            if (!defaultSector) {
                throw new Error("Cannot delete sector with open conversations without another default sector to migrate to.");
            }

            // Move conversations
            await this.prisma.conversation.updateMany({
                where: { sectorId: sectorId },
                data: { sectorId: defaultSector.id }
            });
        }

        return this.prisma.sector.delete({
            where: { id: sectorId, workspaceId }
        });
    }

    // Members
    async addMember(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR') {
        return this.prisma.sectorMember.create({
            data: {
                sectorId,
                userId,
                role
            },
            include: { user: true }
        });
    }

    async removeMember(workspaceId: string, sectorId: string, userId: string) {
        return this.prisma.sectorMember.delete({
            where: {
                sectorId_userId: { sectorId, userId }
            }
        });
    }

    async updateMemberRole(workspaceId: string, sectorId: string, userId: string, role: 'AGENT' | 'SUPERVISOR') {
        return this.prisma.sectorMember.update({
            where: {
                sectorId_userId: { sectorId, userId }
            },
            data: { role }
        });
    }

    async findMatchingSector(workspaceId: string, messageBody: string, senderPhone: string): Promise<string> {
        // 1. Check auto-rules
        const rules = await this.prisma.sectorAutoRule.findMany({
            where: {
                sector: { workspaceId, isActive: true },
                isActive: true
            },
            include: { sector: true },
            orderBy: { priority: 'asc' }
        });

        for (const rule of rules) {
            if (rule.type === 'KEYWORD') {
                const keywords = rule.value.split(',').map(k => k.trim().toLowerCase());
                if (keywords.some(k => messageBody.toLowerCase().includes(k))) {
                    return rule.sectorId;
                }
            }
            // Add more conditions logic here (e.g. SENDER_PHONE if added to enum later or value-based)
        }

        // 2. Return default sector
        const defaultSector = await this.prisma.sector.findFirst({
            where: { workspaceId, isDefault: true }
        });

        if (defaultSector) return defaultSector.id;

        // 3. Fallback: return first created sector
        const firstSector = await this.prisma.sector.findFirst({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' }
        });

        return firstSector?.id;
    }
    async ensureDefaultSectors(workspaceId: string) {
        const count = await this.prisma.sector.count({
            where: { workspaceId }
        });

        if (count === 0) {
            await this.create(workspaceId, {
                name: 'Geral',
                color: '#6366f1',
                isDefault: true,
                isActive: true,
                order: 0
            }, { skipLimitCheck: true });
        }
    }
}
