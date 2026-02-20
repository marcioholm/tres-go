import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogDto {
  workspaceId: string;
  userId?: string;
  actionType: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private prisma: PrismaService) {}

  async logEvent(data: CreateAuditLogDto) {
    try {
      await this.prisma.auditLog.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.userId,
          actionType: data.actionType,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue ? (data.oldValue as Prisma.InputJsonValue) : null,
          newValue: data.newValue ? (data.newValue as Prisma.InputJsonValue) : null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log audit event: ${error.message}`, error.stack);
    }
  }

  async getLogsByEntity(workspaceId: string, entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        workspaceId,
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
