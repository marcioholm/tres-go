"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audio_converter_service_1 = require("./audio-converter.service");
const fs = require("fs");
const path = require("path");
let UploadsService = UploadsService_1 = class UploadsService {
    constructor(prisma, audioConverter) {
        this.prisma = prisma;
        this.audioConverter = audioConverter;
        this.logger = new common_1.Logger(UploadsService_1.name);
    }
    async uploadFile(file, workspaceId, uploadedBy, options) {
        const isAudio = file.mimetype.startsWith('audio/');
        const shouldConvertToPtt = isAudio && (options?.asPtt !== false);
        let fileBuffer = fs.readFileSync(file.path);
        let finalMimeType = file.mimetype;
        let finalFilename = file.filename;
        let duration = 0;
        let waveform = [];
        if (shouldConvertToPtt) {
            try {
                const conversion = await this.audioConverter.convertToOggOpus(fileBuffer, file.mimetype);
                fileBuffer = fs.readFileSync(conversion.outputPath);
                duration = conversion.duration;
                finalMimeType = 'audio/ogg; codecs=opus';
                fs.unlinkSync(file.path);
                finalFilename = `audio-${Date.now()}.ogg`;
                const newPath = path.join(process.cwd(), 'uploads', finalFilename);
                fs.writeFileSync(newPath, fileBuffer);
                conversion.cleanup();
                waveform = await this.audioConverter.extractWaveform(fileBuffer, finalMimeType);
            }
            catch (err) {
                this.logger.error('Failed to convert audio to PTT', err);
            }
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
    getMediaType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'IMAGE';
        if (mimeType.startsWith('video/'))
            return 'VIDEO';
        if (mimeType.startsWith('audio/'))
            return 'AUDIO';
        return 'DOCUMENT';
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audio_converter_service_1.AudioConverterService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map