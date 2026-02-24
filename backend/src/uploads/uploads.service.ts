import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AudioConverterService } from './audio-converter.service';
import * as fs from 'fs';
import * as path from 'path';

export interface MediaUploadResult {
  id?: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  mediaType: string;
  isPtt: boolean;
  duration?: number;
  waveform?: number[];
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private prisma: PrismaService,
    private audioConverter: AudioConverterService,
  ) { }

  async uploadFile(
    file: Express.Multer.File,
    workspaceId: string,
    uploadedBy: string,
    options?: { asPtt?: boolean },
  ): Promise<MediaUploadResult> {
    const fileBuffer = fs.readFileSync(file.path);
    const result = await this.uploadFromBuffer(
      fileBuffer,
      file.originalname,
      file.mimetype,
      workspaceId,
      uploadedBy,
      options,
    );

    // Limpar arquivo temporário do multer
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (e) { }

    return result;
  }

  async uploadFromBuffer(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
    workspaceId: string,
    uploadedBy: string,
    options?: { asPtt?: boolean },
  ): Promise<MediaUploadResult> {
    const isAudio = mimetype.startsWith('audio/');
    const shouldConvertToPtt = isAudio && options?.asPtt !== false;

    let fileBuffer = buffer;
    let finalMimeType = mimetype;
    let finalFilename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
    let duration = 0;
    let waveform: number[] = [];

    if (shouldConvertToPtt) {
      try {
        const conversion = await this.audioConverter.convertToOggOpus(
          fileBuffer,
          mimetype,
        );
        fileBuffer = fs.readFileSync(conversion.outputPath);
        duration = conversion.duration;
        finalMimeType = 'audio/ogg; codecs=opus';
        finalFilename = `audio-${Date.now()}.ogg`;
        const newPath = path.join(process.cwd(), 'uploads', finalFilename);
        fs.writeFileSync(newPath, fileBuffer);
        conversion.cleanup();
        waveform = await this.audioConverter.extractWaveform(
          fileBuffer,
          finalMimeType,
        );
      } catch (err) {
        this.logger.error('Failed to convert audio to PTT', err);
        // Fallback: save original buffer if conversion fails
        const newPath = path.join(process.cwd(), 'uploads', finalFilename);
        if (!fs.existsSync(path.dirname(newPath)))
          fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.writeFileSync(newPath, fileBuffer);
      }
    } else {
      const newPath = path.join(process.cwd(), 'uploads', finalFilename);
      if (!fs.existsSync(path.dirname(newPath)))
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.writeFileSync(newPath, fileBuffer);
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const finalUrl = `${backendUrl}/uploads/${finalFilename}`;

    let uploadRecord = null;
    if (workspaceId && uploadedBy) {
      uploadRecord = await this.prisma.mediaUpload.create({
        data: {
          workspaceId,
          uploadedBy,
          url: finalUrl,
          filename: finalFilename,
          mimeType: finalMimeType,
          size: fileBuffer.length,
          mediaType: shouldConvertToPtt
            ? 'AUDIO'
            : this.getMediaType(finalMimeType),
          isPtt: shouldConvertToPtt,
          duration: duration || undefined,
          waveform: waveform.length ? waveform : undefined,
        },
      });
    }

    return {
      id: uploadRecord?.id,
      url: finalUrl,
      filename: finalFilename,
      mimeType: finalMimeType,
      size: fileBuffer.length,
      mediaType: shouldConvertToPtt
        ? 'AUDIO'
        : this.getMediaType(finalMimeType),
      isPtt: shouldConvertToPtt,
      duration,
      waveform: waveform.length ? waveform : undefined,
    };
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    return 'DOCUMENT';
  }
}
