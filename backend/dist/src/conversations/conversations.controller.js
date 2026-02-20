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
exports.ConversationsController = void 0;
const common_1 = require("@nestjs/common");
const conversations_service_1 = require("./conversations.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let ConversationsController = class ConversationsController {
    constructor(conversationsService) {
        this.conversationsService = conversationsService;
    }
    findAll(workspaceId, status, unreadOnly, search, cursor, limit) {
        return this.conversationsService.findAll(workspaceId, { status, unreadOnly: unreadOnly === 'true', search, cursor, limit: limit ? parseInt(limit) : 20 });
    }
    getKanban(workspaceId) {
        return this.conversationsService.getKanban(workspaceId);
    }
    findOne(workspaceId, id) {
        return this.conversationsService.findOne(workspaceId, id);
    }
    transfer(workspaceId, id, data) {
        return this.conversationsService.transfer(workspaceId, id, data);
    }
    assign(workspaceId, id, agentId) {
        return this.conversationsService.assign(workspaceId, id, agentId);
    }
    resolve(workspaceId, id) {
        return this.conversationsService.resolve(workspaceId, id);
    }
    reopen(workspaceId, id) {
        return this.conversationsService.reopen(workspaceId, id);
    }
    updateKanban(workspaceId, id, body) {
        return this.conversationsService.updateKanban(workspaceId, id, body.column, body.order);
    }
    addTag(workspaceId, id, tagId) {
        return { success: true };
    }
    removeTag(workspaceId, id, tagId) {
        return { success: true };
    }
};
exports.ConversationsController = ConversationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('unreadOnly')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('cursor')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('kanban'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "getKanban", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)(':id/reopen'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "reopen", null);
__decorate([
    (0, common_1.Patch)(':id/kanban'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "updateKanban", null);
__decorate([
    (0, common_1.Post)(':id/tags/:tagId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "addTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:tagId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "removeTag", null);
exports.ConversationsController = ConversationsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/conversations'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [conversations_service_1.ConversationsService])
], ConversationsController);
//# sourceMappingURL=conversations.controller.js.map