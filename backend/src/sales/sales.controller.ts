import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Patch, Delete } from '@nestjs/common';

@Controller('workspaces/:workspaceId/sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() data: any) {
    return this.salesService.create(workspaceId, data);
  }

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query() query: any,
  ) {
    return this.salesService.findAll(workspaceId, query);
  }

  @Get('report')
  getReport(
    @Param('workspaceId') workspaceId: string,
    @Query() query: any,
  ) {
    return this.salesService.getReport(workspaceId, query);
  }

  @Patch(':saleId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('saleId') saleId: string,
    @Body() data: any,
  ) {
    return this.salesService.update(workspaceId, saleId, data);
  }

  @Delete(':saleId')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.salesService.remove(workspaceId, saleId);
  }
}
