import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
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
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string | null;
    })[]> | {
        error: string;
    };
}
