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
exports.SectorsController = void 0;
const common_1 = require("@nestjs/common");
const sectors_service_1 = require("./sectors.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let SectorsController = class SectorsController {
    constructor(sectorsService) {
        this.sectorsService = sectorsService;
    }
    findAll(workspaceId) {
        return this.sectorsService.findAll(workspaceId);
    }
    findOne(workspaceId, id) {
        return this.sectorsService.findOne(workspaceId, id);
    }
    create(workspaceId, body) {
        return this.sectorsService.create(workspaceId, body);
    }
    update(workspaceId, id, body) {
        return this.sectorsService.update(workspaceId, id, body);
    }
    delete(workspaceId, id) {
        return this.sectorsService.delete(workspaceId, id);
    }
    addMember(workspaceId, sectorId, body) {
        return this.sectorsService.addMember(workspaceId, sectorId, body.userId, body.role);
    }
    removeMember(workspaceId, sectorId, userId) {
        return this.sectorsService.removeMember(workspaceId, sectorId, userId);
    }
    updateMemberRole(workspaceId, sectorId, userId, body) {
        return this.sectorsService.updateMemberRole(workspaceId, sectorId, userId, body.role);
    }
};
exports.SectorsController = SectorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Patch)(':id/members/:userId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "updateMemberRole", null);
exports.SectorsController = SectorsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/sectors'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sectors_service_1.SectorsService])
], SectorsController);
//# sourceMappingURL=sectors.controller.js.map