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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let SalesController = class SalesController {
    constructor(salesService) {
        this.salesService = salesService;
    }
    create(workspaceId, data) {
        return this.salesService.create(workspaceId, data);
    }
    findAll(workspaceId, contactId) {
        return this.salesService.findAll(workspaceId, { contactId });
    }
    getSummary(workspaceId) {
        return this.salesService.getSummary(workspaceId);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getSummary", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/sales'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map