import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineService } from './pipeline.service';
import { AppGateway } from '../gateway/app.gateway';
import { RedisService } from '../common/redis.service';

@Injectable()
export class KeywordDetectorService {
    private readonly NEGATIONS = ['não', 'nao', 'nunca', 'jamais', 'cancelar', 'desistir', 'não quero', 'nao quero', 'não tenho interesse', 'nao tenho interesse', 'para de me chamar', 'parar de me chamar'];

    constructor(
        private readonly prisma: PrismaService,
        private readonly pipelineService: PipelineService,
        private readonly gateway: AppGateway,
        private readonly redis: RedisService,
    ) { }

    async detect(
        message: string,
        conversationId: string,
        workspaceId: string,
        sectorId?: string,
    ): Promise<void> {
        try {
            const normalized = message.toLowerCase().trim();
            if (this.hasNegation(normalized)) return;

            const isFirstMessage = await this.isFirstClientMessage(conversationId);
            const wordCount = normalized.split(/\s+/).filter(w => w.length > 0).length;

            const pipeline = await this.getCachedPipeline(workspaceId, sectorId);
            if (!pipeline) return;

            const currentStage = await this.pipelineService.getCurrentStage(conversationId);
            const currentOrder = currentStage ? currentStage.order : -1;

            let bestMatch: { stageId: string, order: number, phrase: string } | null = null;

            for (const stage of pipeline.stages) {
                // Only advance: order must be higher than current
                if (stage.order <= currentOrder) continue;

                for (const keyword of stage.keywords) {
                    const match = this.matches(normalized, keyword.phrase, keyword.matchType, wordCount, isFirstMessage);
                    if (match) {
                        // Pick the stage with the highest order among those that match
                        if (!bestMatch || stage.order > bestMatch.order) {
                            bestMatch = { stageId: stage.id, order: stage.order, phrase: keyword.phrase };
                        }
                    }
                }
            }

            if (bestMatch) {
                const newStage = await this.pipelineService.moveToStage(
                    conversationId,
                    bestMatch.stageId,
                    'AUTOMATIC',
                    bestMatch.phrase,
                );

                // Notify frontend about the automatic change
                this.gateway.emitToWorkspace(workspaceId, 'conversation_stage_changed', {
                    conversationId,
                    stage: newStage,
                    triggeredBy: bestMatch.phrase,
                    automatic: true,
                });
            }
        } catch (err) {
            console.error('[KeywordDetector] Error:', err);
        }
    }

    private hasNegation(text: string): boolean {
        return this.NEGATIONS.some(neg => text.includes(neg));
    }

    private async isFirstClientMessage(conversationId: string): Promise<boolean> {
        const count = await this.prisma.message.count({
            where: { conversationId, fromAgent: false }
        });
        return count <= 1;
    }

    private async getCachedPipeline(workspaceId: string, sectorId?: string) {
        const cacheKey = `pipeline:${workspaceId}:${sectorId || 'default'}`;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('[KeywordDetector] Cache parse error:', e);
            }
        }

        const pipeline = await this.pipelineService.getBySector(workspaceId, sectorId);
        if (pipeline) {
            await this.redis.set(cacheKey, JSON.stringify(pipeline), 300); // 5 mins TTL
        }
        return pipeline;
    }

    private matches(text: string, phrase: string, matchType: string, wordCount: number, isFirstMessage: boolean): boolean {
        const p = phrase.toLowerCase().trim();

        switch (matchType) {
            case 'EXACT':
                return text === p;
            case 'STARTS_WITH':
                return text.startsWith(p);
            case 'CONTAINS':
                const contains = text.includes(p);
                if (!contains) return false;

                // Confidence rule:
                // - Regular: message must have 3+ words.
                // - First message: weight 2 (meaning 1 word is enough).
                return wordCount >= 3 || isFirstMessage;
            default:
                return false;
        }
    }
}
