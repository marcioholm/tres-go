import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { Channel } from '@prisma/client';

@Injectable()
export class ChannelsService {
    constructor(
        private prisma: PrismaService,
        private billing: BillingService
    ) { }

    async create(workspaceId: string, data: any) {
        // Basic validation logic can be added here

        // Check billing limits
        const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de canais (${limitInfo.limit}) atingido para o seu plano.`);
        }
        return this.prisma.channel.create({
            data: {
                ...data,
                workspaceId,
                config: data.config || {}, // Store encrypted credentials here
                isActive: true,
            },
        });
    }

    async findAll(workspaceId: string) {
        return this.prisma.channel.findMany({
            where: { workspaceId },
        });
    }

    async remove(id: string, workspaceId: string) {
        return this.prisma.channel.delete({
            where: { id, workspaceId },
        });
    }

    async update(id: string, body: { name?: string; displayName?: string }, workspaceId: string) {
        return this.prisma.channel.update({
            where: { id, workspaceId },
            data: body,
        });
    }

    // WhatsApp: solicitar código de verificação
    async requestWhatsAppCode(
        body: { phoneNumber: string; method: 'SMS' | 'VOICE'; channelName: string },
        workspaceId: string,
    ): Promise<{ channelId: string }> {
        const { phoneNumber, method, channelName } = body;

        // Limite de canais
        const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
        if (!limitInfo.allowed) {
            throw new BadRequestException(`Limite de canais (${limitInfo.limit}) atingido.`);
        }

        // Criar canal em estado CONNECTING
        const channel = await this.prisma.channel.create({
            data: {
                workspaceId,
                type: 'WHATSAPP',
                name: channelName,
                status: 'CONNECTING',
                phoneNumber,
            },
        });

        // Solicitar código via Meta API
        try {
            const res = await fetch(
                `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/request_code`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code_method: method,
                        language: 'pt_BR',
                    }),
                }
            );

            if (!res.ok) {
                const error = await res.json();
                console.error('WhatsApp request code error:', error);
                await this.prisma.channel.delete({ where: { id: channel.id } });
                throw new BadRequestException('Falha ao solicitar código de verificação');
            }

            return { channelId: channel.id };
        } catch (err) {
            await this.prisma.channel.delete({ where: { id: channel.id } });
            throw new BadRequestException('Erro de comunicação com a Meta');
        }
    }

    // WhatsApp: verificar código
    async verifyWhatsAppCode(
        body: { channelId: string; code: string },
        workspaceId: string,
    ): Promise<Channel> {
        const channel = await this.prisma.channel.findFirst({
            where: { id: body.channelId, workspaceId },
        });

        if (!channel) throw new NotFoundException('Canal não encontrado');

        // Verificar código com a Meta
        const res = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/verify_code`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: body.code }),
            }
        );

        if (!res.ok) {
            throw new BadRequestException('Código inválido ou expirado');
        }

        // Ativar canal
        return this.prisma.channel.update({
            where: { id: channel.id },
            data: { status: 'ACTIVE' },
        });
    }

    // Usado temporariamente para guardar sessão de páginas (Mock)
    private pageSessions = new Map<string, any>();
    async storePageSession(pages: any[]): Promise<string> {
        const key = Math.random().toString(36).substring(7);
        this.pageSessions.set(key, pages);
        return key;
    }
    async getPageSession(key: string) {
        return this.pageSessions.get(key);
    }
}
