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
export declare class AuditLogsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logEvent(data: CreateAuditLogDto): Promise<void>;
    getLogsByEntity(workspaceId: string, entityType: string, entityId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        workspaceId: string | null;
        actionType: string;
        entityType: string | null;
        entityId: string | null;
        target: string | null;
        metadata: Prisma.JsonValue | null;
        ip: string | null;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        userId: string | null;
    })[]>;
}
