import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

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
}
