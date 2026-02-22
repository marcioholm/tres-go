import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePerformanceConfigDto } from './dto/update-performance-config.dto';

@Injectable()
export class PerformanceConfigService {
    constructor(private readonly prisma: PrismaService) { }

    async getConfig(workspaceId: string) {
        let config = await this.prisma.workspacePerformanceConfig.findUnique({
            where: { workspaceId },
        });

        if (!config) {
            config = await this.prisma.workspacePerformanceConfig.create({
                data: { workspaceId },
            });
        }

        return config;
    }

    async updateConfig(workspaceId: string, dto: UpdatePerformanceConfigDto) {
        return this.prisma.workspacePerformanceConfig.upsert({
            where: { workspaceId },
            create: { workspaceId, ...dto },
            update: dto,
        });
    }
}
