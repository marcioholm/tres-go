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
      },
    }),
    BullModule.registerQueue({
      name: 'scheduled-messages',
    }),
    PrismaModule,
    MessagesModule,
  ],
  providers: [ScheduledMessagesService, ScheduledMessagesProcessor],
  controllers: [ScheduledMessagesController],
  exports: [ScheduledMessagesService], // Export so Campaigns can use it
})
export class ScheduledMessagesModule {}
