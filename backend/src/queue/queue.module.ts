import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
// import { MessageWorker } from './message.worker';

@Module({
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
