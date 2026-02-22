import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_characters_!!'; // Must be 32 chars
const IV_LENGTH = 16;

function getKeyBuffer(): Buffer {
    console.log(`[Crypto] ENCRYPTION_KEY length: ${ENCRYPTION_KEY.length}, Hex mode: ${ENCRYPTION_KEY.length === 64}`);
    if (ENCRYPTION_KEY.length === 64) {
        return Buffer.from(ENCRYPTION_KEY, 'hex');
    }
    return Buffer.from(ENCRYPTION_KEY).slice(0, 32);
}

export function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error: any) {
        console.error('[Crypto] Decryption failed, returning original text. Message:', error.message);
        return text;
    }
}
