import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

@Processor('media-processing', {
    concurrency: 2,
})
export class MediaProcessor extends WorkerHost {
    private readonly logger = new Logger(MediaProcessor.name);
    private supabase;

    constructor(private prisma: PrismaService) {
        super();
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    async process(job: Job<any>): Promise<any> {
        const { messageId, whatsappMediaId } = job.data;
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: { conversation: { include: { workspace: true } } },
        });

        if (!message || message.status !== 'PENDING_DOWNLOAD') return;

        try {
            let mediaBuffer: Buffer;
            let mimeType: string;
            let fileName: string = `media-${Date.now()}`;

            const content = message.content as any;

            if (whatsappMediaId) {
                // Handle WhatsApp Cloud API media download (requires token and Meta graph API)
                mediaBuffer = await this.downloadWhatsappMedia(whatsappMediaId, message.conversation.workspaceId);
            } else if (content.originalUrl) {
                // Handle Z-API or other public/signed URLs
                const response = await axios.get(content.originalUrl, { responseType: 'arraybuffer' });
                mediaBuffer = Buffer.from(response.data);
                mimeType = response.headers['content-type'];
            } else {
                throw new Error('No media source found for download');
            }

            // Sniff type
            const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
            const sniffed = await fileTypeFromBuffer(mediaBuffer);
            if (sniffed) {
                mimeType = sniffed.mime;
                fileName += `.${sniffed.ext}`;
            }

            // Upload to Supabase
            let finalUrl = content.originalUrl;
            if (this.supabase) {
                const bucketName = 'media';
                const filePath = `${message.conversation.workspaceId}/${message.id}-${fileName}`;

                const { data, error } = await this.supabase.storage
                    .from(bucketName)
                    .upload(filePath, mediaBuffer, {
                        contentType: mimeType,
                        upsert: true,
                    });

                if (error) throw error;

                const { data: { publicUrl } } = this.supabase.storage
                    .from(bucketName)
                    .getPublicUrl(data.path);

                finalUrl = publicUrl;
            }

            // Update message
            await this.prisma.message.update({
                where: { id: message.id },
                data: {
                    status: message.fromAgent ? 'SENT' : 'RECEIVED',
                    mediaPublicUrl: finalUrl,
                    mimeType: mimeType,
                    mediaType: this.determineMediaType(mimeType),
                    content: {
                        ...content,
                        mediaUrl: finalUrl,
                        mediaType: this.determineMediaType(mimeType),
                    },
                },
            });

        } catch (error) {
            this.logger.error(`Failed to process media for message ${messageId}:`, error);
            await this.prisma.message.update({
                where: { id: messageId },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }

    private async downloadWhatsappMedia(mediaId: string, workspaceId: string): Promise<Buffer> {
        // This requires fetching the channel to get the accessToken
        const channel = await this.prisma.channel.findFirst({
            where: { workspaceId, type: 'WHATSAPP', phoneNumberId: { not: null } },
        });

        if (!channel || !channel.accessToken) throw new Error('WhatsApp channel or access token not found');

        // 1. Get media URL from Graph API
        const urlResponse = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${channel.accessToken}` },
        });

        const mediaUrl = urlResponse.data.url;

        // 2. Download media binary
        const downloadResponse = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${channel.accessToken}` },
            responseType: 'arraybuffer',
        });

        return Buffer.from(downloadResponse.data);
    }

    private determineMediaType(mime: string): string {
        if (mime.startsWith('image/')) return 'IMAGE';
        if (mime.startsWith('audio/')) return 'AUDIO';
        if (mime.startsWith('video/')) return 'VIDEO';
        return 'DOCUMENT';
    }
}
