import { Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get()
    findAll(
        @Param('workspaceId') workspaceId: string,
        @Query('status') status?: string,
        @Query('unreadOnly') unreadOnly?: string,
        @Query('search') search?: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ) {
        return this.conversationsService.findAll(workspaceId, { status, unreadOnly: unreadOnly === 'true', search, cursor, limit: limit ? parseInt(limit) : 20 });
    }

    @Get('kanban')
    getKanban(@Param('workspaceId') workspaceId: string) {
        return this.conversationsService.getKanban(workspaceId);
    }

    @Get(':id')
    findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.conversationsService.findOne(workspaceId, id);
    }

    @Post(':id/transfer')
    transfer(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() data: { agentId?: string, sectorId?: string, note?: string }
    ) {
        return this.conversationsService.transfer(workspaceId, id, data);
    }

    @Patch(':id/assign')
    assign(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Body('agentId') agentId: string) {
        return this.conversationsService.assign(workspaceId, id, agentId);
    }

    @Patch(':id/resolve')
    resolve(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.conversationsService.resolve(workspaceId, id);
    }

    @Patch(':id/reopen')
    reopen(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.conversationsService.reopen(workspaceId, id);
    }

    @Patch(':id/kanban')
    updateKanban(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() body: { column: string; order?: number },
    ) {
        return this.conversationsService.updateKanban(workspaceId, id, body.column, body.order);
    }

    @Post(':id/tags/:tagId')
    addTag(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Param('tagId') tagId: string) {
        // Implementation pending
        return { success: true };
    }

    @Delete(':id/tags/:tagId')
    removeTag(@Param('workspaceId') workspaceId: string, @Param('id') id: string, @Param('tagId') tagId: string) {
        // Implementation pending
        return { success: true };
    }
}
