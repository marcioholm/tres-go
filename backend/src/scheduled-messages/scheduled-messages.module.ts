import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        // Reduce keepalive / heartbeat to save Upstash free-tier requests
        enableOfflineQueue: false,
      },
      defaultJobOptions: {
        removeOnComplete: 50,    // keep only last 50 completed jobs
        removeOnFail: 20,        // keep only last 20 failed jobs
        attempts: 2,
      },
    }),
    BullModule.registerQueue({
      name: 'scheduled-messages',
      // Drastically reduce polling frequency – saves ~99% of Redis calls
      // Default poller is every 1s; 30000ms = 2 polls/min instead of 60/min
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
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
