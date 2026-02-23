import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PipelineService {
    constructor(private readonly prisma: PrismaService) { }

    async getBySector(workspaceId: string, sectorId?: string) {
        if (sectorId) {
            const sectorPipeline = await this.prisma.pipeline.findFirst({
                where: { workspaceId, sectorId },
                include: {
                    stages: {
                        include: { keywords: true },
                        orderBy: { order: 'asc' },
                    },
                    sector: true,
                },
            });
            if (sectorPipeline) return sectorPipeline;
        }

        return this.prisma.pipeline.findFirst({
            where: { workspaceId, isDefault: true },
            include: {
                stages: {
                    include: { keywords: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    async listAll(workspaceId: string) {
        return this.prisma.pipeline.findMany({
            where: { workspaceId },
            include: {
                sector: true,
                stages: {
                    include: { keywords: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async create(workspaceId: string, dto: any) {
        return this.prisma.pipeline.create({
            data: {
                workspaceId,
                name: dto.name,
                description: dto.description,
                sectorId: dto.sectorId || null,
                isDefault: dto.isDefault || false,
                stages: {
                    create: (dto.stages || []).map((stage, index) => ({
                        name: stage.name,
                        color: stage.color || '#6366f1',
                        order: index,
                        isConversion: stage.isConversion || false,
                        keywords: {
                            create: (stage.keywords || []).map(k => ({
                                phrase: k.phrase.toLowerCase().trim(),
                                matchType: k.matchType || 'CONTAINS',
                            })),
                        },
                    })),
                },
            },
            include: { stages: { include: { keywords: true } } },
        });
    }

    async moveToStage(
        conversationId: string,
        stageId: string,
        movedBy: 'AUTOMATIC' | 'MANUAL',
        triggeredBy?: string,
        movedById?: string,
    ) {
        await this.prisma.conversationPipelineStage.create({
            data: { conversationId, stageId, movedBy, triggeredBy, movedById },
        });

        const stage = await this.prisma.pipelineStage.findUnique({ where: { id: stageId } });

        if (stage?.isConversion) {
            await this.prisma.conversation.update({
                where: { id: conversationId },
                data: { convertedAt: new Date() },
            });
        }

        return stage;
    }

    async getCurrentStage(conversationId: string) {
        const last = await this.prisma.conversationPipelineStage.findFirst({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            include: { stage: true },
        });
        return last?.stage || null;
    }

    async getHistory(conversationId: string) {
        return this.prisma.conversationPipelineStage.findMany({
            where: { conversationId },
            include: { stage: true },
            orderBy: { createdAt: 'asc' },
        });
    }
}
