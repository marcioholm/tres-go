export interface AudioConversionResult {
    outputPath: string;
    duration: number;
    cleanup: () => void;
}
export declare class AudioConverterService {
    private readonly logger;
    convertToOggOpus(inputBuffer: Buffer, inputMimeType: string): Promise<AudioConversionResult>;
    extractWaveform(inputBuffer: Buffer, inputMimeType: string): Promise<number[]>;
    private getExtFromMime;
}
