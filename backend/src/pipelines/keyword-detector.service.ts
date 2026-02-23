import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineService } from './pipeline.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class KeywordDetectorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pipelineService: PipelineService,
        private readonly gateway: AppGateway,
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

            const pipeline = await this.pipelineService.getBySector(workspaceId, sectorId);
            if (!pipeline) return;

            const currentStage = await this.pipelineService.getCurrentStage(conversationId);
            const stages = [...pipeline.stages].sort((a, b) => b.order - a.order);

            for (const stage of stages) {
                if (currentStage && stage.order <= currentStage.order) continue;

                for (const keyword of stage.keywords) {
                    if (this.matches(normalized, keyword.phrase, keyword.matchType)) {
                        const newStage = await this.pipelineService.moveToStage(
                            conversationId,
                            stage.id,
                            'AUTOMATIC',
                            keyword.phrase,
                        );

                        this.gateway.server.to(workspaceId).emit('conversation_stage_changed', {
                            conversationId,
                            stage: newStage,
                            triggeredBy: keyword.phrase,
                            automatic: true,
                        });

                        return;
                    }
                }
            }
        } catch (err) {
            console.error('[KeywordDetector] Error:', err);
        }
    }

    private hasNegation(text: string): boolean {
        const negations = ['não ', 'nao ', 'nunca ', 'jamais ', 'não quero', 'não tenho', 'não vou', 'cancelar', 'desistir'];
        return negations.some(neg => text.includes(neg));
    }

    private matches(text: string, phrase: string, matchType: string): boolean {
        switch (matchType) {
            case 'EXACT': return text === phrase;
            case 'STARTS_WITH': return text.startsWith(phrase);
            default: return text.includes(phrase);
        }
    }
}
