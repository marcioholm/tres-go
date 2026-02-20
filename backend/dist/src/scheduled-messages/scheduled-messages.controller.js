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
exports.ScheduledMessagesController = void 0;
const common_1 = require("@nestjs/common");
const scheduled_messages_service_1 = require("./scheduled-messages.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let ScheduledMessagesController = class ScheduledMessagesController {
    constructor(scheduledMessagesService) {
        this.scheduledMessagesService = scheduledMessagesService;
    }
    create(workspaceId, createScheduledMessageDto) {
        return this.scheduledMessagesService.create(workspaceId, createScheduledMessageDto);
    }
    findAll(workspaceId, conversationId) {
        return this.scheduledMessagesService.findAll(workspaceId, conversationId);
    }
    remove(workspaceId, id) {
        return this.scheduledMessagesService.cancel(workspaceId, id);
    }
};
exports.ScheduledMessagesController = ScheduledMessagesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ScheduledMessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScheduledMessagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScheduledMessagesController.prototype, "remove", null);
exports.ScheduledMessagesController = ScheduledMessagesController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/scheduled-messages'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scheduled_messages_service_1.ScheduledMessagesService])
], ScheduledMessagesController);
//# sourceMappingURL=scheduled-messages.controller.js.map