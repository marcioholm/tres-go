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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceBlockMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkspaceBlockMiddleware = class WorkspaceBlockMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        const urlParts = req.originalUrl.split('?')[0].split('/');
        const workspaceIdIndex = urlParts.indexOf('workspaces') + 1;
        const workspaceId = workspaceIdIndex > 0 ? urlParts[workspaceIdIndex] : null;
        if (!workspaceId || workspaceId.length < 5)
            return next();
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { isBlocked: true, blockReason: true },
        });
        if (workspace?.isBlocked) {
            return res.status(402).json({
                statusCode: 402,
                error: 'Payment Required',
                message: workspace.blockReason || 'Conta bloqueada. Entre em contato com o suporte.',
                blocked: true,
            });
        }
        next();
    }
};
exports.WorkspaceBlockMiddleware = WorkspaceBlockMiddleware;
exports.WorkspaceBlockMiddleware = WorkspaceBlockMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceBlockMiddleware);
//# sourceMappingURL=workspace-block.middleware.js.map