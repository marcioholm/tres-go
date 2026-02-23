import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  getLogsByEntity(
    @Param('workspaceId') workspaceId: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      return { error: 'entityType and entityId query parameters are required' };
    }
    return this.auditLogsService.getLogsByEntity(
      workspaceId,
      entityType,
      entityId,
    );
  }
}
