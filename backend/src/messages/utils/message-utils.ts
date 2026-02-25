/**
 * Normalizes message content into a standardized JSON object.
 * This ensures the frontend always receives the same structure, 
 * regardless of whether the message is legacy (string) or new (object).
 */
export function normalizeMessageContent(content: any): any {
    if (content === null || content === undefined) {
        return { text: '', type: 'TEXT', kind: 'text' };
    }

    // Handle legacy string content
    if (typeof content === 'string') {
        return {
            text: content,
            type: 'TEXT',
            kind: 'text',
            body: content, // Backward compatibility
        };
    }

    // Handle object content
    if (typeof content === 'object') {
        let textValue = content.text || content.body || content.caption;

        // Handle nested text objects (common in Z-API / WhatsApp payloads)
        if (typeof textValue === 'object' && textValue !== null) {
            textValue = textValue.message || textValue.text || textValue.body || null;
        }

        const text = String(textValue || (content.kind === 'text' ? '' : ''));

        // Determine type (TEXT, MEDIA, SYSTEM, etc.)
        let type = content.type || (content.mediaUrl || content.url ? 'MEDIA' : 'TEXT');

        // Determine kind (lowercase: text, image, audio, video, sticker, document, location, contact, etc.)
        let kind = (content.kind || content.mediaType || content.type || 'text').toLowerCase();

        // Fallback if kind is invalid or too generic
        if (['received', 'sent', 'message', 'attachment'].includes(kind)) {
            kind = content.mediaType || (content.mediaUrl ? 'media' : 'text');
        }

        // Ensure mediaUrl is a string and not an object
        let mediaUrl = content.mediaUrl || content.url || content.originalUrl || content.mediaOriginalUrl || null;
        if (typeof mediaUrl === 'object' && mediaUrl !== null) {
            mediaUrl = (mediaUrl as any).url || (mediaUrl as any).link || (mediaUrl as any).file || null;
        }

        return {
            ...content,
            text,
            body: text,
            type: String(type).toUpperCase(),
            kind: kind,
            mediaUrl: mediaUrl,
            mediaType: kind, // Ensure mediaType is available for frontend
            mimeType: content.mimeType || content.mimetype || null,
            fileName: content.fileName || content.filename || content.name || null,
            size: content.size || content.fileSize || 0,
        };
    }

    return { text: String(content), type: 'TEXT', kind: 'text' };
}
