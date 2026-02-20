"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledMessagesModule = void 0;
const common_1 = require("@nestjs/common");
const scheduled_messages_service_1 = require("./scheduled-messages.service");
const scheduled_messages_controller_1 = require("./scheduled-messages.controller");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("../prisma/prisma.module");
const scheduled_messages_processor_1 = require("./scheduled-messages.processor");
const messages_module_1 = require("../messages/messages.module");
let ScheduledMessagesModule = class ScheduledMessagesModule {
};
exports.ScheduledMessagesModule = ScheduledMessagesModule;
exports.ScheduledMessagesModule = ScheduledMessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'scheduled-messages',
            }),
            prisma_module_1.PrismaModule,
            messages_module_1.MessagesModule,
        ],
        providers: [scheduled_messages_service_1.ScheduledMessagesService, scheduled_messages_processor_1.ScheduledMessagesProcessor],
        controllers: [scheduled_messages_controller_1.ScheduledMessagesController],
        exports: [scheduled_messages_service_1.ScheduledMessagesService],
    })
], ScheduledMessagesModule);
//# sourceMappingURL=scheduled-messages.module.js.map