import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
export declare class CampaignsProcessor extends WorkerHost {
    private readonly prisma;
    private readonly messagesService;
    constructor(prisma: PrismaService, messagesService: MessagesService);
    process(job: Job<any, any, string>): Promise<any>;
}
