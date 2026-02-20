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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const messages_service_1 = require("../messages/messages.service");
let CampaignsProcessor = class CampaignsProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, messagesService) {
        super();
        this.prisma = prisma;
        this.messagesService = messagesService;
    }
    async process(job) {
        console.log(`Processing campaign step job ${job.id}`);
        const { campaignId, contactId, stepIndex } = job.data;
        try {
            const campaign = await this.prisma.campaign.findUnique({
                where: { id: campaignId },
                include: { steps: { orderBy: { order: 'asc' } } }
            });
            if (!campaign || campaign.status !== 'RUNNING')
                return;
            const contactLog = await this.prisma.campaignContactLog.findUnique({
                where: { campaignId_contactId: { campaignId, contactId } }
            });
            if (!contactLog || contactLog.status !== 'ACTIVE')
                return;
            const step = campaign.steps[stepIndex];
            if (!step) {
                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: { status: 'COMPLETED' }
                });
                return;
            }
            if (step.condition === 'NO_REPLY') {
            }
            const conversation = await this.prisma.conversation.findFirst({
                where: { workspaceId: campaign.workspaceId, contactId }
            });
            if (conversation) {
                await this.messagesService.create(campaign.workspaceId, {
                    conversationId: conversation.id,
                    type: step.mediaUrl ? (step.mediaType?.toUpperCase() || 'IMAGE') : 'TEXT',
                    text: step.content || '',
                    mediaUrl: step.mediaUrl,
                });
            }
            const nextStep = campaign.steps[stepIndex + 1];
            if (nextStep) {
                const nextExecutionAt = new Date(Date.now() + nextStep.delayHours * 3600000);
                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: {
                        currentStepId: nextStep.id,
                        nextExecutionAt
                    }
                });
            }
            else {
                await this.prisma.campaignContactLog.update({
                    where: { id: contactLog.id },
                    data: { status: 'COMPLETED' }
                });
            }
        }
        catch (error) {
            console.error(`Failed to process campaign step ${job.id}`, error);
            await this.prisma.campaignContactLog.update({
                where: { campaignId_contactId: { campaignId, contactId } },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }
};
exports.CampaignsProcessor = CampaignsProcessor;
exports.CampaignsProcessor = CampaignsProcessor = __decorate([
    (0, bullmq_1.Processor)('campaign-steps'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messages_service_1.MessagesService])
], CampaignsProcessor);
//# sourceMappingURL=campaigns.processor.js.map