import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/sectors')
@UseGuards(JwtAuthGuard)
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.sectorsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.sectorsService.findOne(workspaceId, id);
  }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() body: any) {
    return this.sectorsService.create(workspaceId, body);
  }

  @Patch(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.sectorsService.update(workspaceId, id, body);
  }

  @Delete(':id')
  delete(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.sectorsService.delete(workspaceId, id);
  }

  // Members
  @Post(':id/members')
  addMember(
    @Param('workspaceId') workspaceId: string,
    @Param('id') sectorId: string,
    @Body() body: { userId: string; role: 'AGENT' | 'SUPERVISOR' },
  ) {
    return this.sectorsService.addMember(
      workspaceId,
      sectorId,
      body.userId,
      body.role,
    );
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('id') sectorId: string,
    @Param('userId') userId: string,
  ) {
    return this.sectorsService.removeMember(workspaceId, sectorId, userId);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('id') sectorId: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'AGENT' | 'SUPERVISOR' },
  ) {
    return this.sectorsService.updateMemberRole(
      workspaceId,
      sectorId,
      userId,
      body.role,
    );
  }
}
