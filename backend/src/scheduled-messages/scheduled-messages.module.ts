import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    // NOTE: BullModule.forRoot is registered globally in app.module.ts
    // Do NOT register it here again — it would override TLS/auth settings
    BullModule.registerQueue({
      name: 'scheduled-messages',
      defaultJobOptions: {
        removeOnComplete: 50, // keep last 50 completed jobs
        removeOnFail: 20,     // keep last 20 failed jobs
        attempts: 2,
      },
    }),
    PrismaModule,
    MessagesModule,
  ],
  providers: [ScheduledMessagesService, ScheduledMessagesProcessor],
  controllers: [ScheduledMessagesController],
  exports: [ScheduledMessagesService],
})
export class ScheduledMessagesModule { }
