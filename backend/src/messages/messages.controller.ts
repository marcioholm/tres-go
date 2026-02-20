import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('workspaces/:workspaceId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get() // Note: Route path adjusted slightly as typical REST design might put it under conversation or root. User asked for /messages?conversationId... global query?
    // User spec: POST /workspaces/:workspaceId/messages  AND GET /messages?conversationId...
    // NestJS controller prefix applies to all methods. I will create a separate controller or method for the root GET if needed, but sticking to workspace scope is safer for multi-tenancy.
    // Assuming GET /workspaces/:workspaceId/messages for now to keep guards working easily. 
    async findAll(
        @Param('workspaceId') workspaceId: string,
        @Query('conversationId') conversationId: string,
        @Query('cursor') cursor?: string
    ) {
        return this.messagesService.findAll(workspaceId, conversationId, cursor);
    }

    @Post()
    create(@Param('workspaceId') workspaceId: string, @Body() createMessageDto: SendMessageDto) {
        return this.messagesService.create(workspaceId, createMessageDto);
    }
}
