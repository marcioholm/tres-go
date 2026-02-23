import { Module } from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { BillingService } from './billing.service';
import { BillingWebhookController } from './billing-webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule],
  providers: [AsaasService, BillingService],
  controllers: [BillingWebhookController],
  exports: [BillingService, AsaasService],
})
export class BillingModule {}
