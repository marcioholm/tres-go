import { Module } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ArchiveService],
})
export class ArchiveModule {}
