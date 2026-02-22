import { Module } from '@nestjs/common';
import { PerformanceConfigService } from './performance-config.service';
import { SessionService } from './session.service';
import { MetricsService } from './metrics.service';
import { PerformanceController } from './performance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PerformanceController],
    providers: [PerformanceConfigService, SessionService, MetricsService],
    exports: [PerformanceConfigService, SessionService, MetricsService],
})
export class PerformanceModule { }
