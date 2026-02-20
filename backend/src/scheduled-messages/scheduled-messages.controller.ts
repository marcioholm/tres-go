import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/scheduled-messages')
@UseGuards(JwtAuthGuard)
export class ScheduledMessagesController {
    constructor(private readonly scheduledMessagesService: ScheduledMessagesService) { }

    @Post()
    create(@Param('workspaceId') workspaceId: string, @Body() createScheduledMessageDto: any) {
        return this.scheduledMessagesService.create(workspaceId, createScheduledMessageDto);
    }

    @Get()
    findAll(
        @Param('workspaceId') workspaceId: string,
        @Query('conversationId') conversationId?: string
    ) {
        return this.scheduledMessagesService.findAll(workspaceId, conversationId);
    }

    @Delete(':id')
    remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.scheduledMessagesService.cancel(workspaceId, id);
    }
}
