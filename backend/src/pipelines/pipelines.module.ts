import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { KeywordDetectorService } from './keyword-detector.service';
import { QuickReplyService } from './quick-reply.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [GatewayModule],
    providers: [PipelineService, KeywordDetectorService, QuickReplyService],
    exports: [PipelineService, KeywordDetectorService, QuickReplyService],
})
export class PipelinesModule { }
