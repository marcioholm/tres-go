import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { KanbanGateway } from './kanban/kanban.gateway';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [KanbanController],
  providers: [KanbanService, KanbanGateway],
})
export class KanbanModule { }
