import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PerformanceModule } from '../performance/performance.module';
import { GatewayModule } from '../gateway/gateway.module';
import { PipelinesModule } from '../pipelines/pipelines.module';

@Module({
  imports: [
    PrismaModule,
    ConversationsModule,
    ContactsModule,
    PerformanceModule,
    GatewayModule,
    PipelinesModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule { }
