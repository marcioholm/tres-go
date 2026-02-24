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
            body: content, // Backward compatibility for some frontend fields
        };
    }

    // Handle object content
    if (typeof content === 'object') {
        const text = content.text || content.body || content.caption || '';
        const type = content.type || (content.mediaUrl ? 'MEDIA' : 'TEXT');
        const kind = (content.kind || content.mediaType || content.type || 'text').toLowerCase();

        return {
            ...content,
            text,
            body: text, // Normalized field for text
            type: type.toUpperCase(),
            kind: kind,
            mediaUrl: content.mediaUrl || content.url || null,
            mimeType: content.mimeType || content.mimetype || null,
            fileName: content.fileName || content.filename || content.name || null,
            size: content.size || content.fileSize || 0,
        };
    }

    return { text: String(content), type: 'TEXT', kind: 'text' };
}
