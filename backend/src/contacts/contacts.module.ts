import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [PrismaModule, AuditLogsModule],
    controllers: [ContactsController],
    providers: [ContactsService],
})
export class ContactsModule { }
