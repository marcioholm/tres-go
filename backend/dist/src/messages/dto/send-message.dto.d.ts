export declare class SendMessageDto {
    conversationId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    text?: string;
    mediaUrl?: string;
    caption?: string;
    filename?: string;
    isPtt?: boolean;
    duration?: number;
    waveform?: number[];
}
