import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return {
      ok: true,
      service: 'backend-tres-go',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        ok: true,
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ok: false,
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
