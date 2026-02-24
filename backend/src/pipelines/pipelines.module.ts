import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { KeywordDetectorService } from './keyword-detector.service';
import { QuickReplyService } from './quick-reply.service';
import { PipelinesController } from './pipelines.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [GatewayModule],
    controllers: [PipelinesController],
    providers: [PipelineService, KeywordDetectorService, QuickReplyService],
    exports: [PipelineService, KeywordDetectorService, QuickReplyService],
})
export class PipelinesModule { }
