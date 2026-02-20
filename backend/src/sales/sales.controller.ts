import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

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
        @Query('contactId') contactId?: string,
    ) {
        return this.salesService.findAll(workspaceId, { contactId });
    }

    @Get('summary')
    getSummary(@Param('workspaceId') workspaceId: string) {
        return this.salesService.getSummary(workspaceId);
    }
}
