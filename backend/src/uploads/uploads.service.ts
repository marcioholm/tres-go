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
        private audioConverter: AudioConverterService
    ) { }

    async uploadFile(
        file: Express.Multer.File,
        workspaceId: string,
        uploadedBy: string,
        options?: { asPtt?: boolean }
    ): Promise<MediaUploadResult> {
        const isAudio = file.mimetype.startsWith('audio/');
        const shouldConvertToPtt = isAudio && (options?.asPtt !== false);

        let fileBuffer = fs.readFileSync(file.path);
        let finalMimeType = file.mimetype;
        let finalFilename = file.filename;
        let duration = 0;
        let waveform: number[] = [];

        if (shouldConvertToPtt) {
            try {
                // 1. Converter para OGG/Opus
                const conversion = await this.audioConverter.convertToOggOpus(fileBuffer, file.mimetype);

                // 2. Ler o arquivo convertido
                fileBuffer = fs.readFileSync(conversion.outputPath);
                duration = conversion.duration;
                finalMimeType = 'audio/ogg; codecs=opus';

                // Remove old file
                fs.unlinkSync(file.path);

                // Save new converted file into uploads destination manually
                finalFilename = `audio-${Date.now()}.ogg`;
                const newPath = path.join(process.cwd(), 'uploads', finalFilename);
                fs.writeFileSync(newPath, fileBuffer);

                // 3. Limpar temp
                conversion.cleanup();

                // 4. Waveform
                waveform = await this.audioConverter.extractWaveform(fileBuffer, finalMimeType);
            } catch (err) {
                this.logger.error('Failed to convert audio to PTT', err);
                // Fallback to original if conversion fails
            }
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const finalUrl = `${backendUrl}/uploads/${finalFilename}`;

        let uploadRecord = null;

        // Some routes might not include workspaceId if just uploading blindly
        if (workspaceId && uploadedBy) {
            uploadRecord = await this.prisma.mediaUpload.create({
                data: {
                    workspaceId,
                    uploadedBy,
                    url: finalUrl,
                    filename: finalFilename,
                    mimeType: finalMimeType,
                    size: fileBuffer.length,
                    mediaType: shouldConvertToPtt ? 'AUDIO' : this.getMediaType(finalMimeType),
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
            mediaType: shouldConvertToPtt ? 'AUDIO' : this.getMediaType(finalMimeType),
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
