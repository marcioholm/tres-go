import { Module } from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { BillingService } from './billing.service';
import { BillingWebhookController } from './billing-webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';
import { ImplementationModule } from '../implementation/implementation.module';

@Module({
  imports: [PrismaModule, GatewayModule, ImplementationModule],
  providers: [BillingService],
  controllers: [BillingWebhookController],
  exports: [BillingService],
})
export class BillingModule { }
