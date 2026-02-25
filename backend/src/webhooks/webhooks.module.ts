import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PerformanceModule } from '../performance/performance.module';
import { GatewayModule } from '../gateway/gateway.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { UploadsModule } from '../uploads/uploads.module';

import { BullModule } from '@nestjs/bullmq';
import { WebhooksProcessor } from './webhooks.processor';

@Module({
  imports: [
    PrismaModule,
    ConversationsModule,
    ContactsModule,
    PerformanceModule,
    GatewayModule,
    PipelinesModule,
    UploadsModule,
    BullModule.registerQueue({
      name: 'webhooks-processing',
    }),
    BullModule.registerQueue({
      name: 'media-processing',
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule { }
