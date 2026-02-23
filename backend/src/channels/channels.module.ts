import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { MetaOAuthService } from './meta-oauth.service';
import { ChannelsController } from './channels.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';
import { MetaWebhookController } from './meta-webhook.controller';
import { MetaWebhookService } from './meta-webhook.service';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { forwardRef } from '@nestjs/common';
import { MetaIntegrationController } from './meta-integration.controller';
import { MetaIntegrationService } from './meta-integration.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    PrismaModule,
    BillingModule,
    ContactsModule,
    ConversationsModule,
    forwardRef(() => MessagesModule),
    GatewayModule,
  ],
  providers: [
    ChannelsService,
    MetaOAuthService,
    MetaWebhookService,
    MetaIntegrationService,
  ],
  controllers: [
    ChannelsController,
    MetaWebhookController,
    MetaIntegrationController,
  ],
  exports: [ChannelsService, MetaOAuthService],
})
export class ChannelsModule {}
