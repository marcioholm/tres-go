"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelsModule = void 0;
const common_1 = require("@nestjs/common");
const channels_service_1 = require("./channels.service");
const meta_oauth_service_1 = require("./meta-oauth.service");
const channels_controller_1 = require("./channels.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const billing_module_1 = require("../billing/billing.module");
const meta_webhook_controller_1 = require("./meta-webhook.controller");
const meta_webhook_service_1 = require("./meta-webhook.service");
let ChannelsModule = class ChannelsModule {
};
exports.ChannelsModule = ChannelsModule;
exports.ChannelsModule = ChannelsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, billing_module_1.BillingModule],
        providers: [channels_service_1.ChannelsService, meta_oauth_service_1.MetaOAuthService, meta_webhook_service_1.MetaWebhookService],
        controllers: [channels_controller_1.ChannelsController, meta_webhook_controller_1.MetaWebhookController],
        exports: [channels_service_1.ChannelsService, meta_oauth_service_1.MetaOAuthService],
    })
], ChannelsModule);
//# sourceMappingURL=channels.module.js.map