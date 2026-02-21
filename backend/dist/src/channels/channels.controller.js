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
exports.ChannelsController = void 0;
const common_1 = require("@nestjs/common");
const channels_service_1 = require("./channels.service");
const passport_1 = require("@nestjs/passport");
const meta_oauth_service_1 = require("./meta-oauth.service");
let ChannelsController = class ChannelsController {
    constructor(channelsService, metaOAuth) {
        this.channelsService = channelsService;
        this.metaOAuth = metaOAuth;
    }
    create(workspaceId, data) {
        return this.channelsService.create(workspaceId, data);
    }
    findAll(workspaceId) {
        return this.channelsService.findAll(workspaceId);
    }
    update(workspaceId, id, data) {
        return this.channelsService.update(id, data, workspaceId);
    }
    remove(workspaceId, id) {
        return this.channelsService.remove(id, workspaceId);
    }
    getMetaOAuthUrl(workspaceId, type, name) {
        return this.metaOAuth.generateOAuthUrl(type, workspaceId, name);
    }
    async metaCallback(code, res) {
        const { pages } = await this.metaOAuth.exchangeCodeForToken(code);
        const sessionKey = await this.channelsService.storePageSession(pages);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/configuracoes/canais/callback?key=${sessionKey}`);
    }
    async getMetaPages(key) {
        const pages = await this.channelsService.getPageSession(key);
        if (!pages)
            throw new NotFoundException('Sessão expirada ou inválida');
        return pages;
    }
    requestWhatsAppCode(workspaceId, body) {
        return this.channelsService.requestWhatsAppCode(body, workspaceId);
    }
    verifyWhatsAppCode(workspaceId, body) {
        return this.channelsService.verifyWhatsAppCode(body, workspaceId);
    }
};
exports.ChannelsController = ChannelsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('oauth/meta'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "getMetaOAuthUrl", null);
__decorate([
    (0, common_1.Get)('oauth/meta/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "metaCallback", null);
__decorate([
    (0, common_1.Get)('oauth/meta/pages'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "getMetaPages", null);
__decorate([
    (0, common_1.Post)('whatsapp/request-code'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "requestWhatsAppCode", null);
__decorate([
    (0, common_1.Post)('whatsapp/verify-code'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "verifyWhatsAppCode", null);
exports.ChannelsController = ChannelsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/channels'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [channels_service_1.ChannelsService,
        meta_oauth_service_1.MetaOAuthService])
], ChannelsController);
//# sourceMappingURL=channels.controller.js.map