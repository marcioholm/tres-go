import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { KeywordDetectorService } from './keyword-detector.service';
import { QuickReplyService } from './quick-reply.service';
import { PipelinesController } from './pipelines.controller';
import { GatewayModule } from '../gateway/gateway.module';

import { RedisService } from '../common/redis.service';

@Module({
    imports: [GatewayModule],
    controllers: [PipelinesController],
    providers: [PipelineService, KeywordDetectorService, QuickReplyService, RedisService],
    exports: [PipelineService, KeywordDetectorService, QuickReplyService, RedisService],
})
export class PipelinesModule { }
