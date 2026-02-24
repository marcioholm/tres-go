import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { QuickReplyService } from './quick-reply.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
    constructor(
        private readonly pipelineService: PipelineService,
        private readonly quickReplyService: QuickReplyService,
    ) { }

    @Get('by-sector')
    async getBySector(
        @Param('workspaceId') workspaceId: string,
        @Query('sectorId') sectorId?: string,
    ) {
        return this.pipelineService.getBySector(workspaceId, sectorId);
    }

    @Get('quick-replies')
    async getQuickReplies(@Param('workspaceId') workspaceId: string) {
        return this.quickReplyService.findAll(workspaceId);
    }

    @Get()
    async listAll(@Param('workspaceId') workspaceId: string) {
        return this.pipelineService.listAll(workspaceId);
    }
}
