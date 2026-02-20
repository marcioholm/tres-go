"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditLogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogsService = AuditLogsService_1 = class AuditLogsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditLogsService_1.name);
    }
    async logEvent(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    workspaceId: data.workspaceId,
                    userId: data.userId,
                    actionType: data.actionType,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValue: data.oldValue ? data.oldValue : null,
                    newValue: data.newValue ? data.newValue : null,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log audit event: ${error.message}`, error.stack);
        }
    }
    async getLogsByEntity(workspaceId, entityType, entityId) {
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
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = AuditLogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map