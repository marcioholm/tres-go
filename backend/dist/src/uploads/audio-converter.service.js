"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AudioConverterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioConverterService = void 0;
const common_1 = require("@nestjs/common");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
let AudioConverterService = AudioConverterService_1 = class AudioConverterService {
    constructor() {
        this.logger = new common_1.Logger(AudioConverterService_1.name);
    }
    async convertToOggOpus(inputBuffer, inputMimeType) {
        const tmpDir = os.tmpdir();
        const inputExt = this.getExtFromMime(inputMimeType);
        const inputPath = path.join(tmpDir, `nw-audio-in-${Date.now()}${inputExt}`);
        const outputPath = path.join(tmpDir, `nw-audio-out-${Date.now()}.ogg`);
        fs.writeFileSync(inputPath, inputBuffer);
        return new Promise((resolve, reject) => {
            let duration = 0;
            ffmpeg(inputPath)
                .audioCodec('libopus')
                .audioChannels(1)
                .audioFrequency(48000)
                .audioBitrate('32k')
                .format('ogg')
                .outputOptions([
                '-application voip',
                '-vbr on',
                '-compression_level 10',
            ])
                .on('codecData', (data) => {
                const parts = data.duration?.split(':');
                if (parts?.length === 3) {
                    duration = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                }
            })
                .on('end', () => {
                fs.unlinkSync(inputPath);
                this.logger.log(`Audio converted to OGG/Opus: ${outputPath} (${duration.toFixed(1)}s)`);
                resolve({
                    outputPath,
                    duration: Math.round(duration),
                    cleanup: () => {
                        if (fs.existsSync(outputPath))
                            fs.unlinkSync(outputPath);
                    },
                });
            })
                .on('error', (err) => {
                if (fs.existsSync(inputPath))
                    fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath))
                    fs.unlinkSync(outputPath);
                this.logger.error(`FFmpeg conversion failed: ${err.message}`);
                reject(new Error(`Falha na conversão de áudio: ${err.message}`));
            })
                .save(outputPath);
        });
    }
    async extractWaveform(inputBuffer, inputMimeType) {
        const tmpDir = os.tmpdir();
        const inputExt = this.getExtFromMime(inputMimeType);
        const inputPath = path.join(tmpDir, `nw-waveform-${Date.now()}${inputExt}`);
        const outputPath = path.join(tmpDir, `nw-waveform-${Date.now()}.raw`);
        fs.writeFileSync(inputPath, inputBuffer);
        return new Promise((resolve) => {
            ffmpeg(inputPath)
                .audioChannels(1)
                .audioFrequency(8000)
                .format('s16le')
                .on('end', () => {
                try {
                    const rawData = fs.readFileSync(outputPath);
                    const samples = new Int16Array(rawData.buffer);
                    const bucketSize = Math.floor(samples.length / 40);
                    const waveform = [];
                    for (let i = 0; i < 40; i++) {
                        let sum = 0;
                        for (let j = 0; j < bucketSize; j++) {
                            sum += Math.abs(samples[i * bucketSize + j]);
                        }
                        waveform.push(sum / bucketSize / 32768);
                    }
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                    resolve(waveform);
                }
                catch {
                    resolve(Array(40).fill(0.3));
                }
            })
                .on('error', () => {
                if (fs.existsSync(inputPath))
                    fs.unlinkSync(inputPath);
                resolve(Array(40).fill(0.3));
            })
                .save(outputPath);
        });
    }
    getExtFromMime(mime) {
        const map = {
            'audio/webm': '.webm',
            'audio/webm;codecs=opus': '.webm',
            'audio/ogg': '.ogg',
            'audio/ogg;codecs=opus': '.ogg',
            'audio/mpeg': '.mp3',
            'audio/mp3': '.mp3',
            'audio/mp4': '.m4a',
            'audio/x-m4a': '.m4a',
            'audio/wav': '.wav',
            'audio/wave': '.wav',
            'audio/aac': '.aac',
        };
        return map[mime] || '.audio';
    }
};
exports.AudioConverterService = AudioConverterService;
exports.AudioConverterService = AudioConverterService = AudioConverterService_1 = __decorate([
    (0, common_1.Injectable)()
], AudioConverterService);
//# sourceMappingURL=audio-converter.service.js.map