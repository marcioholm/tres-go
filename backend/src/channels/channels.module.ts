import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [PrismaModule, BillingModule],
    providers: [ChannelsService],
    controllers: [ChannelsController],
    exports: [ChannelsService],
})
export class ChannelsModule { }
