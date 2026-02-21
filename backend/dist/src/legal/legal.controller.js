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
exports.LegalController = void 0;
const common_1 = require("@nestjs/common");
const legal_service_1 = require("./legal.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let LegalController = class LegalController {
    constructor(legalService) {
        this.legalService = legalService;
    }
    async acceptTerms(req, body) {
        const userId = req.user.id || req.user.sub;
        return this.legalService.recordAcceptance(userId, {
            termsVersion: body.termsVersion || '1.0',
            privacyVersion: body.privacyVersion || '1.0',
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    }
    async getAcceptance(req) {
        const userId = req.user.id || req.user.sub;
        return this.legalService.getAcceptance(userId);
    }
};
exports.LegalController = LegalController;
__decorate([
    (0, common_1.Post)('accept'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LegalController.prototype, "acceptTerms", null);
__decorate([
    (0, common_1.Get)('acceptance'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LegalController.prototype, "getAcceptance", null);
exports.LegalController = LegalController = __decorate([
    (0, common_1.Controller)('legal'),
    __metadata("design:paramtypes", [legal_service_1.LegalService])
], LegalController);
//# sourceMappingURL=legal.controller.js.map