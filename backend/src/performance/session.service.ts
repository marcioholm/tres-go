import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PerformanceConfigService } from './performance-config.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: PerformanceConfigService,
    ) { }

    // Iniciar sessão quando atendente assume conversa
    async startSession(conversationId: string, agentId: string): Promise<void> {
        // Fechar sessão anterior se existir
        await this.endActiveSession(conversationId, 'REASSIGNED');

        await this.prisma.conversationSession.create({
            data: { conversationId, agentId },
        });

        console.log(`[Session] Sessão iniciada — conversa: ${conversationId}, agente: ${agentId}`);
    }

    // Encerrar sessão ativa
    async endActiveSession(
        conversationId: string,
        reason: 'RESOLVED' | 'TRANSFERRED' | 'REASSIGNED',
    ): Promise<void> {
        const session = await this.prisma.conversationSession.findFirst({
            where: { conversationId, endedAt: null },
        });

        if (!session) return;

        const endedAt = new Date();
        const durationMinutes = Math.floor(
            (endedAt.getTime() - session.startedAt.getTime()) / 60000,
        );

        await this.prisma.conversationSession.update({
            where: { id: session.id },
            data: {
                endedAt,
                endReason: reason,
                durationMinutes,
            },
        });
    }

    // Registrar mensagem enviada pelo agente
    async trackAgentMessage(conversationId: string, agentId: string): Promise<void> {
        const session = await this.prisma.conversationSession.findFirst({
            where: { conversationId, agentId, endedAt: null },
        });

        if (!session) return;

        const update: any = {
            messagesSent: { increment: 1 },
        };

        // Registrar primeira resposta
        if (!session.firstResponseAt) {
            const firstResponseAt = new Date();
            const firstResponseMinutes = Math.floor(
                (firstResponseAt.getTime() - session.startedAt.getTime()) / 60000,
            );
            update.firstResponseAt = firstResponseAt;
            update.firstResponseMinutes = firstResponseMinutes;
        }

        await this.prisma.conversationSession.update({
            where: { id: session.id },
            data: update,
        });
    }

    // Registrar mensagem recebida do cliente
    async trackClientMessage(conversationId: string): Promise<void> {
        const session = await this.prisma.conversationSession.findFirst({
            where: { conversationId, endedAt: null },
        });

        if (!session) return;

        await this.prisma.conversationSession.update({
            where: { id: session.id },
            data: {
                messagesReceived: { increment: 1 },
            },
        });
    }

    // Calcular tempo de atendimento conforme regra configurada
    async calculateAttendanceTime(
        conversationId: string,
        workspaceId: string,
    ): Promise<number> {
        const config = await this.configService.getConfig(workspaceId);
        const sessions = await this.prisma.conversationSession.findMany({
            where: { conversationId },
        });

        if (config.timeCalculation === 'TOTAL') {
            // Soma duração de todas as sessões
            return sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        }

        // ACTIVE_ONLY — exclui períodos de inatividade
        let activeMinutes = 0;
        for (const session of sessions) {
            if (!session.durationMinutes) continue;
            // Considerar apenas até o threshold de inatividade
            activeMinutes += Math.min(session.durationMinutes, config.inactivityThreshold);
        }
        return activeMinutes;
    }
}
