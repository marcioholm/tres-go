import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardMetrics(
    @Param('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getDashboardMetrics(workspaceId, { start, end });
  }

  @Get('agents')
  getAgentPerformance(
    @Param('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getAgentPerformance(workspaceId, { start, end });
  }

  @Get('volume')
  getVolumeByDay(
    @Param('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getVolumeByDay(workspaceId, { start, end });
  }

  @Get('sectors')
  getSectorMetrics(@Param('workspaceId') workspaceId: string) {
    return this.reportsService.getSectorMetrics(workspaceId);
  }

  @Get('funnel')
  getFunnelMetrics(@Param('workspaceId') workspaceId: string) {
    return this.reportsService.getFunnelMetrics(workspaceId);
  }

  @Get('traffic')
  getTrafficSourceMetrics(@Param('workspaceId') workspaceId: string) {
    return this.reportsService.getTrafficSourceMetrics(workspaceId);
  }

  @Get('pending')
  getPendingConversations(@Param('workspaceId') workspaceId: string) {
    return this.reportsService.getPendingConversations(workspaceId);
  }
}
