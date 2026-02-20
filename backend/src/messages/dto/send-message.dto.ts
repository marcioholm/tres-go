export class SendMessageDto {
    conversationId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    text?: string;
    mediaUrl?: string;
    caption?: string;
    filename?: string;
    isPtt?: boolean;       // novo: true = mensagem de voz, false = arquivo de áudio
    duration?: number;     // novo: duração em segundos
    waveform?: number[];   // novo: array de amplitudes para exibição
}
