import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  @Get()
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Patch()
  update(@Param('workspaceId') workspaceId: string, @Body() data: any) {
    return this.workspacesService.update(workspaceId, data);
  }

  @Get('members')
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Post('members/invite')
  inviteMember(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { email: string; role: string },
  ) {
    return this.workspacesService.inviteMember(
      workspaceId,
      body.email,
      body.role,
    );
  }

  @Patch('members/:userId')
  updateMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() data: any,
  ) {
    return this.workspacesService.updateMember(workspaceId, userId, data.role);
  }

  @Delete('members/:userId')
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId);
  }

  @Get('business-hours')
  getBusinessHours(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getBusinessHours(workspaceId);
  }

  @Put('business-hours')
  updateBusinessHours(
    @Param('workspaceId') workspaceId: string,
    @Body() hours: any[],
  ) {
    return this.workspacesService.updateBusinessHours(workspaceId, hours);
  }

  @Get('quick-replies')
  getQuickReplies(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getQuickReplies(workspaceId);
  }

  @Post('quick-replies')
  createQuickReply(
    @Param('workspaceId') workspaceId: string,
    @Body() data: any,
  ) {
    return this.workspacesService.createQuickReply(
      workspaceId,
      data.command || data.shortcut,
      data.title || 'Sem título',
      data.content,
    );
  }

  @Delete('quick-replies/:id')
  deleteQuickReply(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.workspacesService.deleteQuickReply(workspaceId, id);
  }
}
