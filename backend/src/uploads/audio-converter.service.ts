import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface AudioConversionResult {
    outputPath: string;   // caminho do arquivo OGG convertido
    duration: number;     // duração em segundos
    cleanup: () => void;  // função para deletar o arquivo temp
}

@Injectable()
export class AudioConverterService {
    private readonly logger = new Logger(AudioConverterService.name);

    /**
     * Converte qualquer formato de áudio para OGG/Opus
     * Requisito para envio como PTT (mensagem de voz) no WhatsApp
     */
    async convertToOggOpus(inputBuffer: Buffer, inputMimeType: string): Promise<AudioConversionResult> {
        const tmpDir = os.tmpdir();
        const inputExt = this.getExtFromMime(inputMimeType);
        const inputPath = path.join(tmpDir, `nw-audio-in-${Date.now()}${inputExt}`);
        const outputPath = path.join(tmpDir, `nw-audio-out-${Date.now()}.ogg`);

        // Salvar input em arquivo temp
        fs.writeFileSync(inputPath, inputBuffer);

        return new Promise((resolve, reject) => {
            let duration = 0;

            ffmpeg(inputPath)
                .audioCodec('libopus')          // Codec Opus — obrigatório para WhatsApp PTT
                .audioChannels(1)               // Mono — WhatsApp só aceita mono
                .audioFrequency(48000)          // 48kHz — padrão Opus
                .audioBitrate('32k')            // 32kbps — qualidade boa, arquivo pequeno
                .format('ogg')                  // Container OGG
                .outputOptions([
                    '-application voip',          // Otimizado para voz (não música)
                    '-vbr on',                    // Variable bitrate
                    '-compression_level 10',      // Máxima compressão
                ])
                .on('codecData', (data) => {
                    // Extrair duração do arquivo original
                    const parts = data.duration?.split(':');
                    if (parts?.length === 3) {
                        duration = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                    }
                })
                .on('end', () => {
                    // Limpar arquivo de entrada
                    fs.unlinkSync(inputPath);
                    this.logger.log(`Audio converted to OGG/Opus: ${outputPath} (${duration.toFixed(1)}s)`);

                    resolve({
                        outputPath,
                        duration: Math.round(duration),
                        cleanup: () => {
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        },
                    });
                })
                .on('error', (err) => {
                    // Limpar arquivos temp em caso de erro
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    this.logger.error(`FFmpeg conversion failed: ${err.message}`);
                    reject(new Error(`Falha na conversão de áudio: ${err.message}`));
                })
                .save(outputPath);
        });
    }

    /**
     * Extrai a waveform do áudio para exibição no chat
     * Retorna array de 40 amplitudes normalizadas (0-1)
     */
    async extractWaveform(inputBuffer: Buffer, inputMimeType: string): Promise<number[]> {
        const tmpDir = os.tmpdir();
        const inputExt = this.getExtFromMime(inputMimeType);
        const inputPath = path.join(tmpDir, `nw-waveform-${Date.now()}${inputExt}`);
        const outputPath = path.join(tmpDir, `nw-waveform-${Date.now()}.raw`);

        fs.writeFileSync(inputPath, inputBuffer);

        return new Promise((resolve) => {
            ffmpeg(inputPath)
                .audioChannels(1)
                .audioFrequency(8000)           // Downsampled para análise rápida
                .format('s16le')                // Raw PCM 16-bit little-endian
                .on('end', () => {
                    try {
                        const rawData = fs.readFileSync(outputPath);
                        const samples = new Int16Array(rawData.buffer);
                        const bucketSize = Math.floor(samples.length / 40);
                        const waveform: number[] = [];

                        for (let i = 0; i < 40; i++) {
                            let sum = 0;
                            for (let j = 0; j < bucketSize; j++) {
                                sum += Math.abs(samples[i * bucketSize + j]);
                            }
                            waveform.push(sum / bucketSize / 32768); // normalizar 0-1
                        }

                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                        resolve(waveform);
                    } catch {
                        resolve(Array(40).fill(0.3)); // fallback
                    }
                })
                .on('error', () => {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    resolve(Array(40).fill(0.3)); // fallback silencioso
                })
                .save(outputPath);
        });
    }

    private getExtFromMime(mime: string): string {
        const map: Record<string, string> = {
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
}
