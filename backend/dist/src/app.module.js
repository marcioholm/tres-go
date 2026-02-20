"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const workspaces_module_1 = require("./workspaces/workspaces.module");
const channels_module_1 = require("./channels/channels.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const gateway_module_1 = require("./gateway/gateway.module");
const conversations_module_1 = require("./conversations/conversations.module");
const messages_module_1 = require("./messages/messages.module");
const reports_module_1 = require("./reports/reports.module");
const tags_module_1 = require("./tags/tags.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const contacts_module_1 = require("./contacts/contacts.module");
const queue_module_1 = require("./queue/queue.module");
const sales_module_1 = require("./sales/sales.module");
const kanban_module_1 = require("./kanban/kanban.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const scheduled_messages_module_1 = require("./scheduled-messages/scheduled-messages.module");
const sectors_module_1 = require("./sectors/sectors.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
const schedule_1 = require("@nestjs/schedule");
const archive_module_1 = require("./archive/archive.module");
const billing_module_1 = require("./billing/billing.module");
const bullmq_1 = require("@nestjs/bullmq");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const workspace_block_middleware_1 = require("./common/middleware/workspace-block.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(workspace_block_middleware_1.WorkspaceBlockMiddleware)
            .exclude({ path: 'auth/(.*)', method: common_1.RequestMethod.ALL }, { path: 'billing/webhook', method: common_1.RequestMethod.POST }, { path: 'super-admin/(.*)', method: common_1.RequestMethod.ALL })
            .forRoutes({ path: 'workspaces/*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: Number(process.env.REDIS_PORT) || 6379,
                    password: process.env.REDIS_PASSWORD,
                    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
            sectors_module_1.SectorsModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            contacts_module_1.ContactsModule,
            tags_module_1.TagsModule,
            channels_module_1.ChannelsModule,
            campaigns_module_1.CampaignsModule,
            scheduled_messages_module_1.ScheduledMessagesModule,
            gateway_module_1.GatewayModule,
            audit_logs_module_1.AuditLogsModule,
            billing_module_1.BillingModule,
            super_admin_module_1.SuperAdminModule,
            webhooks_module_1.WebhooksModule,
            reports_module_1.ReportsModule,
            queue_module_1.QueueModule,
            sales_module_1.SalesModule,
            kanban_module_1.KanbanModule,
            schedule_1.ScheduleModule.forRoot(),
            archive_module_1.ArchiveModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map