import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SectorsModule } from '../sectors/sectors.module';
import { GatewayModule } from '../gateway/gateway.module';
import { BillingModule } from '../billing/billing.module';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    PrismaModule,
    SectorsModule,
    GatewayModule,
    BillingModule,
    PerformanceModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule { }
