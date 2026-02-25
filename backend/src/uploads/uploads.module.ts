import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AudioConverterService } from './audio-converter.service';
import { PrismaModule } from '../prisma/prisma.module';

import { MediaProcessor } from './media.processor';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    PrismaModule,
  ],
  providers: [UploadsService, AudioConverterService, MediaProcessor],
  controllers: [UploadsController],
  exports: [UploadsService, AudioConverterService],
})
export class UploadsModule { }
