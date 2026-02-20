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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = class WebhooksController {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    verifyWhatsapp(phoneNumberId, mode, token, challenge, res) {
        if (mode === 'subscribe' && token === 'northway_omni_token') {
            console.log('Webhook verified for', phoneNumberId);
            return res.status(common_1.HttpStatus.OK).send(challenge);
        }
        return res.status(common_1.HttpStatus.FORBIDDEN).send();
    }
    async handleWhatsappMessage(phoneNumberId, body, res) {
        console.log('Received WhatsApp message for', phoneNumberId);
        const workspaceId = "default-workspace-id";
        await this.webhooksService.processWhatsappMessage(workspaceId, body);
        return res.status(common_1.HttpStatus.OK).send('EVENT_RECEIVED');
    }
    handleZapiMessage(instanceId, body, res) {
        console.log('Received Z-API message for', instanceId);
        return res.status(common_1.HttpStatus.OK).send({ success: true });
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Get)('whatsapp/:phoneNumberId'),
    __param(0, (0, common_1.Param)('phoneNumberId')),
    __param(1, (0, common_1.Query)('hub.mode')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __param(3, (0, common_1.Query)('hub.challenge')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "verifyWhatsapp", null);
__decorate([
    (0, common_1.Post)('whatsapp/:phoneNumberId'),
    __param(0, (0, common_1.Param)('phoneNumberId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleWhatsappMessage", null);
__decorate([
    (0, common_1.Post)('zapi/:instanceId'),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "handleZapiMessage", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map