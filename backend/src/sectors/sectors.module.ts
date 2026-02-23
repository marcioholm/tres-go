import { Module } from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { SectorsController } from './sectors.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';
// import { GatewayModule } from '../events/gateway.module'; // Will be added later
// import { QueueModule } from '../queues/queue.module'; // Will be added later

@Module({
  imports: [PrismaModule, BillingModule],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [SectorsService],
})
export class SectorsModule {}
