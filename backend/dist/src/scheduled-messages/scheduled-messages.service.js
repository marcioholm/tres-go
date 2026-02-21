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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledMessagesService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ScheduledMessagesService = class ScheduledMessagesService {
    constructor(scheduledMessagesQueue, prisma) {
        this.scheduledMessagesQueue = scheduledMessagesQueue;
        this.prisma = prisma;
    }
    async create(workspaceId, data) {
        let { conversationId, agentId, type, content, scheduledAt, mediaUrl, mediaType } = data;
        let { channelId } = data;
        if (content && typeof content === 'object') {
            mediaUrl = mediaUrl || content.mediaUrl;
            mediaType = mediaType || content.mediaType;
            if (content.isPtt) {
                type = 'AUDIO';
            }
        }
        if (!channelId) {
            const conversation = await this.prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (conversation) {
                channelId = conversation.channelId;
            }
            else {
                throw new Error('Conversation not found');
            }
        }
        const scheduledMessage = await this.prisma.scheduledMessage.create({
            data: {
                workspaceId,
                conversationId,
                channelId,
                agentId,
                type: type || (mediaUrl ? (content?.isPtt ? 'AUDIO' : mediaType || 'TEXT') : 'TEXT'),
                content: typeof content === 'object' ? content : { text: content, mediaUrl, mediaType },
                scheduledAt: new Date(scheduledAt),
                status: client_1.ScheduledStatus.PENDING,
            },
        });
        const delay = new Date(scheduledAt).getTime() - Date.now();
        if (delay > 0) {
            await this.scheduledMessagesQueue.add('send-message', {
                scheduledMessageId: scheduledMessage.id,
                messageParams: {
                    workspaceId,
                    conversationId,
                    type: type || 'TEXT',
                    fromAgent: true,
                    status: 'PENDING',
                    content: typeof content === 'object' ? content : { text: content, mediaUrl, mediaType },
                },
            }, { delay, jobId: scheduledMessage.id });
        }
        return scheduledMessage;
    }
    async findAll(workspaceId, conversationId) {
        return this.prisma.scheduledMessage.findMany({
            where: {
                workspaceId,
                ...(conversationId && { conversationId }),
                status: 'PENDING'
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async cancel(workspaceId, id) {
        const job = await this.scheduledMessagesQueue.getJob(id);
        if (job) {
            await job.remove();
        }
        return this.prisma.scheduledMessage.update({
            where: { id, workspaceId },
            data: { status: client_1.ScheduledStatus.CANCELLED },
        });
    }
};
exports.ScheduledMessagesService = ScheduledMessagesService;
exports.ScheduledMessagesService = ScheduledMessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('scheduled-messages')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], ScheduledMessagesService);
//# sourceMappingURL=scheduled-messages.service.js.map