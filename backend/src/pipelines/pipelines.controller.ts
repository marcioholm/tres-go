import { Controller, Get, Param, Query, UseGuards, Post, Body, Req, Put, Delete } from '@nestjs/common';
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

    @Post()
    async create(@Param('workspaceId') workspaceId: string, @Body() body: any) {
        return this.pipelineService.create(workspaceId, body);
    }

    @Post('move')
    async move(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { conversationId: string, stageId: string },
        @Req() req: any,
    ) {
        return this.pipelineService.moveToStage(
            body.conversationId,
            body.stageId,
            'MANUAL',
            undefined,
            req.user?.id
        );
    }

    @Post(':id') // Correcting fallback for create in case frontend uses it
    async createWithId(@Param('workspaceId') workspaceId: string, @Body() body: any) {
        return this.pipelineService.create(workspaceId, body);
    }

    @Put(':id')
    async update(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() body: any
    ) {
        return this.pipelineService.update(id, workspaceId, body);
    }

    @Get(':id')
    async findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.pipelineService.listAll(workspaceId).then(list => list.find(p => p.id === id));
    }
}
