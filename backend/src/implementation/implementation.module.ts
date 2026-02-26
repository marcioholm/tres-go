import { Module } from '@nestjs/common';
import { ImplementationService } from './implementation.service';
import { ImplementationController } from './implementation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [PrismaModule, BillingModule],
    controllers: [ImplementationController],
    providers: [ImplementationService],
    exports: [ImplementationService],
})
export class ImplementationModule { }
