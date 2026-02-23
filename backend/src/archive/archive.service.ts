import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArchiveService {
  private readonly logger = new Logger(ArchiveService.name);

  constructor(private prisma: PrismaService) {}

  // Run every night at 3:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDataArchiving() {
    this.logger.log('Starting data archiving job...');

    // We will archive messages from closed conversations older than 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    try {
      // Find conversations that have been closed and haven't been updated in 3 months
      const oldConversations = await this.prisma.conversation.findMany({
        where: {
          status: 'CLOSED',
          updatedAt: { lte: threeMonthsAgo },
        },
        select: { id: true },
      });

      if (oldConversations.length === 0) {
        this.logger.log('No old conversations to archive.');
        return;
      }

      const conversationIds = oldConversations.map((c) => c.id);

      this.logger.log(
        `Found ${conversationIds.length} conversations to archive. Moving messages...`,
      );

      // Ideally we would do this in chunks in a real huge DB
      for (const convId of conversationIds) {
        // Move messages to ArchivedMessage
        const messages = await this.prisma.message.findMany({
          where: { conversationId: convId },
        });

        if (messages.length === 0) continue;

        const archivedData = messages.map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          fromAgent: msg.fromAgent,
          isInternalNote: msg.isInternalNote,
          type: msg.type,
          content: msg.content,
          status: msg.status,
          externalId: msg.externalId,
          createdAt: msg.createdAt,
          archivedAt: new Date(),
        }));

        await this.prisma.$transaction([
          this.prisma.archivedMessage.createMany({
            data: archivedData,
            skipDuplicates: true,
          }),
          this.prisma.message.deleteMany({ where: { conversationId: convId } }),
        ]);

        this.logger.debug(
          `Archived ${messages.length} messages for conversation ${convId}`,
        );
      }

      this.logger.log('Data archiving completed successfully.');

      this.logger.log('Starting old media expiration sweep...');
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const oldMedia = await this.prisma.mediaUpload.findMany({
        where: {
          mediaType: { in: ['audio', 'video'] },
          createdAt: { lte: ninetyDaysAgo },
        },
      });

      let deletedMediaCount = 0;
      for (const media of oldMedia) {
        // e.g. /uploads/12398412893-audio.mp3
        const filename = path.basename(media.url);
        const filePath = path.join(process.cwd(), 'uploads', filename);

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          await this.prisma.mediaUpload.delete({
            where: { id: media.id },
          });

          deletedMediaCount++;
        } catch (fileErr) {
          this.logger.error(`Failed to delete media file ${filePath}`, fileErr);
        }
      }

      this.logger.log(
        `Media expiration sweep completed. Deleted ${deletedMediaCount} old media files.`,
      );
    } catch (error) {
      this.logger.error('Error during data archiving job', error);
    }
  }
}
