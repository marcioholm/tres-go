import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workspaces/:workspaceId/channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) { }

    @Post()
    create(@Param('workspaceId') workspaceId: string, @Body() data: any) {
        return this.channelsService.create(workspaceId, data);
    }

    @Get()
    findAll(@Param('workspaceId') workspaceId: string) {
        return this.channelsService.findAll(workspaceId);
    }
}
