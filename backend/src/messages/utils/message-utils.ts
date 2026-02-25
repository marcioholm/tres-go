/**
 * Normalizes message content into a standardized JSON object.
 * This ensures the frontend always receives the same structure, 
 * regardless of whether the message is legacy (string) or new (object).
 */
export function normalizeMessageContent(content: any): any {
    if (content === null || content === undefined) {
        return { text: '', type: 'TEXT', kind: 'text' };
    }

    let raw = content;

    // Handle string (JSON or raw)
    if (typeof content === 'string') {
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            try {
                raw = JSON.parse(content);
            } catch (e) {
                return { text: content, body: content, type: 'TEXT', kind: 'text' };
            }
        } else {
            return { text: content, body: content, type: 'TEXT', kind: 'text' };
        }
    }

    if (typeof raw !== 'object' || raw === null) {
        return { text: String(raw), body: String(raw), type: 'TEXT', kind: 'text' };
    }

    // Aggressive text search in common keys
    let textValue = raw.text || raw.body || raw.message || raw.caption || raw.content || raw.body_text || '';

    // Handle nested text objects (common in Z-API / WhatsApp payloads)
    if (typeof textValue === 'object' && textValue !== null) {
        textValue = textValue.message || textValue.text || textValue.body || textValue.content || '';
    }

    const text = String(textValue || '');

    // Determine type (TEXT, MEDIA, SYSTEM, etc.)
    let type = raw.type || (raw.mediaUrl || raw.url || raw.originalUrl ? 'MEDIA' : 'TEXT');

    // Determine kind (lowercase: text, image, audio, video, sticker, document, location, contact, etc.)
    let kind = (raw.kind || raw.mediaType || raw.type || (text ? 'text' : 'unknown')).toLowerCase();

    // Fallback if kind is invalid or too generic
    if (['received', 'sent', 'message', 'attachment', 'media'].includes(kind)) {
        if (raw.mediaType) kind = raw.mediaType.toLowerCase();
        else if (text && !raw.mediaUrl) kind = 'text';
    }

    // Media fallbacks for contact list preview ("Sem mensagens" fix)
    let normalizedText = text;
    if (!normalizedText && (raw.mediaUrl || raw.url || raw.originalUrl || raw.mediaOriginalUrl || kind !== 'text')) {
        if (kind === 'image') normalizedText = '📷 Foto';
        else if (kind === 'video') normalizedText = '🎥 Vídeo';
        else if (kind === 'audio') normalizedText = '🎵 Áudio';
        else if (kind === 'sticker') normalizedText = '🎨 Figurinha';
        else if (kind === 'document') normalizedText = '📄 Documento';
        else if (kind === 'location') normalizedText = '📍 Localização';
        else if (kind === 'contact') normalizedText = '👤 Contato';
        else if (raw.mediaUrl || raw.url) normalizedText = '📎 Arquivo';
    }

    // PTT / Voice note detection
    const isPtt = raw.isPtt || raw.isVoiceNote || kind === 'ptt' || (kind === 'audio' && raw.mimeType?.includes('ogg'));

    // Ensure mediaUrl is a string and not an object
    let mediaUrl = raw.mediaUrl || raw.url || raw.originalUrl || raw.mediaOriginalUrl || null;
    if (typeof mediaUrl === 'object' && mediaUrl !== null) {
        mediaUrl = (mediaUrl as any).url || (mediaUrl as any).link || (mediaUrl as any).file || null;
    }

    return {
        ...raw,
        text: normalizedText,
        body: normalizedText,
        type: String(type).toUpperCase(),
        kind: kind,
        isPtt: !!isPtt,
        mediaUrl: mediaUrl,
        mediaType: kind,
        mimeType: raw.mimeType || raw.mimetype || null,
        fileName: raw.fileName || raw.filename || raw.name || null,
        size: raw.size || raw.fileSize || 0,
    };
}
