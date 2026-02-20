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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_service_1 = require("./super-admin.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
const super_admin_guard_1 = require("../common/guards/super-admin.guard");
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    async getDashboard() {
        return this.superAdminService.getDashboardMetrics();
    }
    async getWorkspaces(query) {
        return this.superAdminService.getWorkspaces(query);
    }
    async getWorkspaceDetails(id) {
        return this.superAdminService.getWorkspaceDetails(id);
    }
    async blockWorkspace(id, reason, req) {
        return this.superAdminService.blockWorkspace(id, reason || 'Ação do Super Admin', req.user.sub);
    }
    async unblockWorkspace(id, req) {
        return this.superAdminService.unblockWorkspace(id, req.user.sub);
    }
    async changeWorkspacePlan(id, planSlug) {
        return this.superAdminService.changeWorkspacePlan(id, planSlug);
    }
    async deleteWorkspace(id, req) {
        return this.superAdminService.deleteWorkspace(id, req.user.sub);
    }
    async getPlans() {
        return this.superAdminService.getPlans();
    }
    async createPlan(data) {
        return this.superAdminService.createPlan(data);
    }
    async updatePlan(id, data) {
        return this.superAdminService.updatePlan(id, data);
    }
    async getAllUsers(search) {
        return this.superAdminService.getAllUsers(search);
    }
    async getHealth() {
        return this.superAdminService.getSystemHealth();
    }
    async getAdmins() {
        return this.superAdminService.getAdmins();
    }
    async promoteToAdmin(userId) {
        return this.superAdminService.promoteToAdmin(userId);
    }
    async revokeAdmin(id) {
        return this.superAdminService.revokeAdmin(id);
    }
    async getFinancialReports(query) {
        return this.superAdminService.getFinancialReports(query);
    }
    async getAuditLogs(query) {
        return this.superAdminService.getAuditLogs(query);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('workspaces'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getWorkspaces", null);
__decorate([
    (0, common_1.Get)('workspaces/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getWorkspaceDetails", null);
__decorate([
    (0, common_1.Post)('workspaces/:id/block'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "blockWorkspace", null);
__decorate([
    (0, common_1.Post)('workspaces/:id/unblock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "unblockWorkspace", null);
__decorate([
    (0, common_1.Put)('workspaces/:id/plan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('planSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "changeWorkspacePlan", null);
__decorate([
    (0, common_1.Delete)('workspaces/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteWorkspace", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Put)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Post)('admins/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "promoteToAdmin", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "revokeAdmin", null);
__decorate([
    (0, common_1.Get)('reports/financial'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getFinancialReports", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAuditLogs", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map