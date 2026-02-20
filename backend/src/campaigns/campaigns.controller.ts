import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Get()
    findAll(@Param('workspaceId') workspaceId: string) {
        return this.campaignsService.findAll(workspaceId);
    }

    @Get(':id')
    findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.campaignsService.findOne(workspaceId, id);
    }

    @Post()
    create(@Param('workspaceId') workspaceId: string, @Body() data: any) {
        return this.campaignsService.create(workspaceId, data);
    }

    @Post(':id/start')
    start(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.campaignsService.start(workspaceId, id);
    }

    @Post(':id/pause')
    pause(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.campaignsService.pause(workspaceId, id);
    }

    @Delete(':id')
    remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.campaignsService.delete(workspaceId, id);
    }
}
