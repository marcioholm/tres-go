import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { Express } from 'express';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('workspaceId') workspaceId?: string,
    @Body('uploadedBy') uploadedBy?: string,
    @Body('isPtt') isPtt?: string,
  ) {
    const asPtt = isPtt === 'true';

    if (workspaceId && uploadedBy) {
      // Salva no banco e converte se for PTT
      return await this.uploadsService.uploadFile(
        file,
        workspaceId,
        uploadedBy,
        { asPtt },
      );
    }

    // Fluxo básico legado caso workspaceId não seja fonecido
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return {
      url: `${backendUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
    };
  }
}
