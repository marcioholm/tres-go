import { PrismaService } from '../prisma/prisma.service';
import { AudioConverterService } from './audio-converter.service';
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
export declare class UploadsService {
    private prisma;
    private audioConverter;
    private readonly logger;
    constructor(prisma: PrismaService, audioConverter: AudioConverterService);
    uploadFile(file: Express.Multer.File, workspaceId: string, uploadedBy: string, options?: {
        asPtt?: boolean;
    }): Promise<MediaUploadResult>;
    private getMediaType;
}
