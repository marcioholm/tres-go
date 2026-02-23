import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelsModule } from '../channels/channels.module';
import { ScheduledMessagesModule } from '../scheduled-messages/scheduled-messages.module';
import { BullModule } from '@nestjs/bullmq';
import { CampaignsProcessor } from './campaigns.processor';
import { MessagesModule } from '../messages/messages.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    ChannelsModule,
    ScheduledMessagesModule,
    MessagesModule,
    BillingModule,
    BullModule.registerQueue({
      name: 'campaign-steps',
    }),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsProcessor],
})
export class CampaignsModule {}
