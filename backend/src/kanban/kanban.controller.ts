import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/kanban')
@UseGuards(JwtAuthGuard)
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get()
  getBoard(@Param('workspaceId') workspaceId: string) {
    return this.kanbanService.getBoard(workspaceId);
  }

  @Post('deals')
  createDeal(
    @Param('workspaceId') workspaceId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.kanbanService.createDeal(workspaceId, data, req.user?.sub);
  }

  @Patch('deals/:id')
  updateDeal(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    if (data.columnId && data.order !== undefined) {
      return this.kanbanService.moveDeal(
        workspaceId,
        id,
        data.columnId,
        data.order,
        userId,
      );
    }
    return this.kanbanService.updateDeal(workspaceId, id, data, userId);
  }

  @Delete('deals/:id')
  deleteDeal(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.kanbanService.deleteDeal(workspaceId, id, req.user?.sub);
  }

  @Patch('columns/:id')
  updateColumn(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.kanbanService.updateColumn(
      workspaceId,
      id,
      data,
      req.user?.sub,
    );
  }
}
