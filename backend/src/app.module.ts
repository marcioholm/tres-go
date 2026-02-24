import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { GatewayModule } from './gateway/gateway.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { TagsModule } from './tags/tags.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ContactsModule } from './contacts/contacts.module';
import { QueueModule } from './queue/queue.module';
import { SalesModule } from './sales/sales.module';
import { KanbanModule } from './kanban/kanban.module';
import { UploadsModule } from './uploads/uploads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduledMessagesModule } from './scheduled-messages/scheduled-messages.module';
import { SectorsModule } from './sectors/sectors.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ArchiveModule } from './archive/archive.module';
import { BillingModule } from './billing/billing.module';
import { BullModule } from '@nestjs/bullmq';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { LegalModule } from './legal/legal.module';
import { PerformanceModule } from './performance/performance.module';
import { WorkspaceBlockMiddleware } from './common/middleware/workspace-block.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const useTls = process.env.REDIS_TLS === 'true' || redisPort === 6380 || (redisUrl && redisUrl.startsWith('rediss://'));

        console.log(`[Redis Config] Connecting via ${redisUrl ? 'URL' : 'Host:Port'}. TLS: ${useTls}`);

        const connection: any = redisUrl ? { url: redisUrl } : {
          host: redisHost,
          port: redisPort,
          password: process.env.REDIS_PASSWORD,
        };

        connection.maxRetriesPerRequest = null;
        connection.enableOfflineQueue = false;
        connection.lazyConnect = true;

        if (useTls) {
          connection.tls = { rejectUnauthorized: false };
        }

        return {
          connection,
          defaultJobOptions: { removeOnComplete: 50, removeOnFail: 20 },
          onClientCreated: (client) => {
            client.on('error', (err) => console.error('[Redis Error]', err));
            client.once('ready', () => console.log('[Redis Ready] Connected to Redis'));
          }
        };
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    SectorsModule,
    ConversationsModule,
    MessagesModule,
    ContactsModule,
    TagsModule,
    ChannelsModule,
    CampaignsModule,
    ScheduledMessagesModule,
    GatewayModule,
    AuditLogsModule,
    BillingModule,
    SuperAdminModule,
    // New Modules
    WebhooksModule,
    ReportsModule,
    QueueModule,
    SalesModule,
    KanbanModule,
    ScheduleModule.forRoot(),
    ArchiveModule,
    LegalModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WorkspaceBlockMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'billing/webhook', method: RequestMethod.POST },
        { path: 'super-admin/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes({ path: 'workspaces/*', method: RequestMethod.ALL });
  }
}
