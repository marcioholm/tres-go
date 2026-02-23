import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelsModule } from '../channels/channels.module';
import { GatewayModule } from '../gateway/gateway.module';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ChannelsModule),
    GatewayModule,
    PerformanceModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule { }
