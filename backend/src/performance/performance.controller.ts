import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PerformanceConfigService } from './performance-config.service';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { UpdatePerformanceConfigDto } from './dto/update-performance-config.dto';

@Controller('workspaces/:workspaceId/performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(
    private readonly configService: PerformanceConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('config')
  getConfig(@Param('workspaceId') workspaceId: string) {
    return this.configService.getConfig(workspaceId);
  }

  @Put('config')
  updateConfig(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdatePerformanceConfigDto,
  ) {
    return this.configService.updateConfig(workspaceId, dto);
  }

  @Get('metrics')
  getMetrics(
    @Param('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('agentId') agentId?: string,
  ) {
    const period = {
      start: start
        ? new Date(start)
        : new Date(new Date().setDate(new Date().getDate() - 30)),
      end: end ? new Date(end) : new Date(),
    };

    if (agentId) {
      return this.metricsService.getAgentMetrics(workspaceId, agentId, period);
    }
    return this.metricsService.getWorkspaceMetrics(workspaceId, period);
  }

  @Post('conversions')
  registerConversion(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { conversationId: string; value?: number },
    @Req() req: any,
  ) {
    const agentId = req.user.id;
    return this.metricsService.registerConversion(
      workspaceId,
      body.conversationId,
      agentId,
      body.value,
    );
  }
}
