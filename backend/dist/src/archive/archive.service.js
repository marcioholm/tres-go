"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ArchiveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
let ArchiveService = ArchiveService_1 = class ArchiveService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ArchiveService_1.name);
    }
    async handleDataArchiving() {
        this.logger.log('Starting data archiving job...');
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        try {
            const oldConversations = await this.prisma.conversation.findMany({
                where: {
                    status: 'CLOSED',
                    updatedAt: { lte: threeMonthsAgo }
                },
                select: { id: true }
            });
            if (oldConversations.length === 0) {
                this.logger.log('No old conversations to archive.');
                return;
            }
            const conversationIds = oldConversations.map(c => c.id);
            this.logger.log(`Found ${conversationIds.length} conversations to archive. Moving messages...`);
            for (const convId of conversationIds) {
                const messages = await this.prisma.message.findMany({
                    where: { conversationId: convId }
                });
                if (messages.length === 0)
                    continue;
                const archivedData = messages.map(msg => ({
                    id: msg.id,
                    conversationId: msg.conversationId,
                    fromAgent: msg.fromAgent,
                    isInternalNote: msg.isInternalNote,
                    type: msg.type,
                    content: msg.content,
                    status: msg.status,
                    externalId: msg.externalId,
                    createdAt: msg.createdAt,
                    archivedAt: new Date()
                }));
                await this.prisma.$transaction([
                    this.prisma.archivedMessage.createMany({ data: archivedData, skipDuplicates: true }),
                    this.prisma.message.deleteMany({ where: { conversationId: convId } })
                ]);
                this.logger.debug(`Archived ${messages.length} messages for conversation ${convId}`);
            }
            this.logger.log('Data archiving completed successfully.');
            this.logger.log('Starting old media expiration sweep...');
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const oldMedia = await this.prisma.mediaUpload.findMany({
                where: {
                    mediaType: { in: ['audio', 'video'] },
                    createdAt: { lte: ninetyDaysAgo }
                }
            });
            let deletedMediaCount = 0;
            for (const media of oldMedia) {
                const filename = path.basename(media.url);
                const filePath = path.join(process.cwd(), 'uploads', filename);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    await this.prisma.mediaUpload.delete({
                        where: { id: media.id }
                    });
                    deletedMediaCount++;
                }
                catch (fileErr) {
                    this.logger.error(`Failed to delete media file ${filePath}`, fileErr);
                }
            }
            this.logger.log(`Media expiration sweep completed. Deleted ${deletedMediaCount} old media files.`);
        }
        catch (error) {
            this.logger.error('Error during data archiving job', error);
        }
    }
};
exports.ArchiveService = ArchiveService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArchiveService.prototype, "handleDataArchiving", null);
exports.ArchiveService = ArchiveService = ArchiveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArchiveService);
//# sourceMappingURL=archive.service.js.map