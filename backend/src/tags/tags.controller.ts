import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.tagsService.findAll(workspaceId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() data: { name: string; color: string },
  ) {
    return this.tagsService.create(workspaceId, data.name, data.color);
  }

  @Patch(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.tagsService.update(workspaceId, id, data.name, data.color);
  }

  @Delete(':id')
  remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.tagsService.delete(workspaceId, id);
  }
}
