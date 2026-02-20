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
exports.TagsController = void 0;
const common_1 = require("@nestjs/common");
const tags_service_1 = require("./tags.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let TagsController = class TagsController {
    constructor(tagsService) {
        this.tagsService = tagsService;
    }
    findAll(workspaceId) {
        return this.tagsService.findAll(workspaceId);
    }
    create(workspaceId, data) {
        return this.tagsService.create(workspaceId, data.name, data.color);
    }
    update(workspaceId, id, data) {
        return this.tagsService.update(workspaceId, id, data.name, data.color);
    }
    remove(workspaceId, id) {
        return this.tagsService.delete(workspaceId, id);
    }
};
exports.TagsController = TagsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "remove", null);
exports.TagsController = TagsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/tags'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tags_service_1.TagsService])
], TagsController);
//# sourceMappingURL=tags.controller.js.map