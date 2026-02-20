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
exports.KanbanController = void 0;
const common_1 = require("@nestjs/common");
const kanban_service_1 = require("./kanban.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let KanbanController = class KanbanController {
    constructor(kanbanService) {
        this.kanbanService = kanbanService;
    }
    getBoard(workspaceId) {
        return this.kanbanService.getBoard(workspaceId);
    }
    createDeal(workspaceId, data, req) {
        return this.kanbanService.createDeal(workspaceId, data, req.user?.sub);
    }
    updateDeal(workspaceId, id, data, req) {
        const userId = req.user?.sub;
        if (data.columnId && data.order !== undefined) {
            return this.kanbanService.moveDeal(workspaceId, id, data.columnId, data.order, userId);
        }
        return this.kanbanService.updateDeal(workspaceId, id, data, userId);
    }
    deleteDeal(workspaceId, id, req) {
        return this.kanbanService.deleteDeal(workspaceId, id, req.user?.sub);
    }
    updateColumn(workspaceId, id, data, req) {
        return this.kanbanService.updateColumn(workspaceId, id, data, req.user?.sub);
    }
};
exports.KanbanController = KanbanController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Post)('deals'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "createDeal", null);
__decorate([
    (0, common_1.Patch)('deals/:id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "updateDeal", null);
__decorate([
    (0, common_1.Delete)('deals/:id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "deleteDeal", null);
__decorate([
    (0, common_1.Patch)('columns/:id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "updateColumn", null);
exports.KanbanController = KanbanController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/kanban'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kanban_service_1.KanbanService])
], KanbanController);
//# sourceMappingURL=kanban.controller.js.map