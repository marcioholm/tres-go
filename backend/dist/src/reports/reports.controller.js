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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboardMetrics(workspaceId, start, end) {
        return this.reportsService.getDashboardMetrics(workspaceId, { start, end });
    }
    getAgentPerformance(workspaceId, start, end) {
        return this.reportsService.getAgentPerformance(workspaceId, { start, end });
    }
    getVolumeByDay(workspaceId, start, end) {
        return this.reportsService.getVolumeByDay(workspaceId, { start, end });
    }
    getSectorMetrics(workspaceId) {
        return this.reportsService.getSectorMetrics(workspaceId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('agents'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAgentPerformance", null);
__decorate([
    (0, common_1.Get)('volume'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getVolumeByDay", null);
__decorate([
    (0, common_1.Get)('sectors'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSectorMetrics", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/reports'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map