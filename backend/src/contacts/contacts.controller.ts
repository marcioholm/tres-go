import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('workspaces/:workspaceId/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('reports/sources')
  getSourcesReport(@Param('workspaceId') workspaceId: string) {
    return this.contactsService.getSourcesReport(workspaceId);
  }

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('search') search?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.findAll(workspaceId, {
      search,
      cursor,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.contactsService.findOne(workspaceId, id);
  }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() data: any) {
    return this.contactsService.create(workspaceId, data);
  }

  @Patch(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.contactsService.update(workspaceId, id, data, req.user?.sub);
  }

  @Patch(':id/source')
  updateSource(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.contactsService.updateSource(
      workspaceId,
      id,
      data,
      req.user?.sub,
    );
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.contactsService.delete(workspaceId, id, req.user?.sub);
  }

  @Post(':id/tags/:tagId')
  addTag(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ) {
    return this.contactsService.addTag(workspaceId, id, tagId);
  }

  @Delete(':id/tags/:tagId')
  removeTag(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ) {
    return this.contactsService.removeTag(workspaceId, id, tagId);
  }

  @Post(':id/notes')
  addNote(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: { content: string; userId: string },
  ) {
    // In a real app, userId would come from the JWT, but user spec asks for body userId or implies session
    return this.contactsService.addNote(
      workspaceId,
      id,
      body.userId,
      body.content,
    );
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: any,
  ) {
    return this.contactsService.importCsv(workspaceId, file);
  }

  @Post('bulk-tags')
  bulkTagAction(
    @Param('workspaceId') workspaceId: string,
    @Body()
    data: { contactIds: string[]; tagId: string; action: 'add' | 'remove' },
  ) {
    return this.contactsService.bulkTagAction(workspaceId, data);
  }
}
