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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const workspaces_service_1 = require("./workspaces.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let WorkspacesController = class WorkspacesController {
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    findOne(workspaceId) {
        return this.workspacesService.findOne(workspaceId);
    }
    update(workspaceId, data) {
        return this.workspacesService.update(workspaceId, data);
    }
    getMembers(workspaceId) {
        return this.workspacesService.getMembers(workspaceId);
    }
    inviteMember(workspaceId, body) {
        return this.workspacesService.inviteMember(workspaceId, body.email, body.role);
    }
    updateMember(workspaceId, userId, data) {
        return this.workspacesService.updateMember(workspaceId, userId, data.role);
    }
    removeMember(workspaceId, userId) {
        return this.workspacesService.removeMember(workspaceId, userId);
    }
    getBusinessHours(workspaceId) {
        return this.workspacesService.getBusinessHours(workspaceId);
    }
    updateBusinessHours(workspaceId, hours) {
        return this.workspacesService.updateBusinessHours(workspaceId, hours);
    }
    getQuickReplies(workspaceId) {
        return this.workspacesService.getQuickReplies(workspaceId);
    }
    createQuickReply(workspaceId, data) {
        return this.workspacesService.createQuickReply(workspaceId, data.shortcut, data.content);
    }
    deleteQuickReply(workspaceId, id) {
        return this.workspacesService.deleteQuickReply(workspaceId, id);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('members'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)('members/invite'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Patch)('members/:userId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)('members/:userId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('business-hours'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "getBusinessHours", null);
__decorate([
    (0, common_1.Put)('business-hours'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "updateBusinessHours", null);
__decorate([
    (0, common_1.Get)('quick-replies'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "getQuickReplies", null);
__decorate([
    (0, common_1.Post)('quick-replies'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "createQuickReply", null);
__decorate([
    (0, common_1.Delete)('quick-replies/:id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "deleteQuickReply", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map