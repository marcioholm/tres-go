import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [PrismaModule, ConversationsModule, GatewayModule],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule { }
