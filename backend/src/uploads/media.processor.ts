import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { MessageType, MediaStatus, MessageProvider } from '@prisma/client';
import { decrypt } from '../utils/crypto.util';

@Processor('media-processing', {
    concurrency: 5,
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
            include: { conversation: { include: { channel: true } } },
        });

        if (!message || message.mediaStatus !== MediaStatus.PENDING) return;

        try {
            let mediaBuffer: Buffer;
            let mimeType: string = message.mediaMimeType || 'application/octet-stream';
            let fileName: string = message.mediaFileName || `media-${Date.now()}`;

            if (message.provider === MessageProvider.WA_CLOUD && whatsappMediaId) {
                mediaBuffer = await this.downloadWhatsappMedia(whatsappMediaId, message.conversation.channel);
            } else if (message.mediaOriginalUrl) {
                // Handling Z-API or direct URLs
                const response = await axios.get(message.mediaOriginalUrl, {
                    responseType: 'arraybuffer',
                    timeout: 45000,
                    maxContentLength: 52428800 // 50MB
                });
                mediaBuffer = Buffer.from(response.data);
                if (response.headers['content-type']) {
                    mimeType = response.headers['content-type'];
                }
            } else {
                throw new Error('No media source found for download');
            }

            // Sniff type via magic bytes
            try {
                const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import('file-type')>);
                const sniffed = await fileTypeFromBuffer(mediaBuffer);
                if (sniffed) {
                    mimeType = sniffed.mime;
                    if (!message.mediaFileName) {
                        fileName += `.${sniffed.ext}`;
                    }
                }
            } catch (sniffError) {
                this.logger.warn(`Could not sniff type for message ${messageId}: ${sniffError.message}`);
            }

            // Upload to Supabase Storage
            let finalUrl = message.mediaOriginalUrl;
            if (this.supabase) {
                const bucketName = 'media';
                const workspacePath = message.workspaceId || 'common';
                const filePath = `${workspacePath}/${message.id}-${fileName}`;

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

            // Update Message with final data
            await this.prisma.message.update({
                where: { id: message.id },
                data: {
                    mediaStatus: MediaStatus.READY,
                    mediaFinalUrl: finalUrl,
                    mediaMimeType: mimeType,
                    mediaSize: mediaBuffer.length,
                    mediaFileName: fileName,
                },
            });

            this.logger.log(`Success: Media processed for message ${messageId}. Path: ${finalUrl}`);

        } catch (error) {
            this.logger.error(`Failed to process media for message ${messageId}:`, error);
            await this.prisma.message.update({
                where: { id: messageId },
                data: { mediaStatus: MediaStatus.FAILED },
            });
            throw error;
        }
    }

    private async downloadWhatsappMedia(mediaId: string, channel: any): Promise<Buffer> {
        if (!channel || !channel.accessToken) {
            throw new Error('WhatsApp channel or access token not found for media download');
        }

        // 1. Get media URL from Graph API
        const token = decrypt(channel.accessToken);
        const urlResponse = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const mediaUrl = urlResponse.data.url;

        // 2. Download media binary
        const downloadResponse = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer',
        });

        return Buffer.from(downloadResponse.data);
    }
}
