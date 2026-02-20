import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ScheduledMessagesProcessor extends WorkerHost {
    private readonly messagesService;
    private readonly prisma;
    constructor(messagesService: MessagesService, prisma: PrismaService);
    process(job: Job<any, any, string>): Promise<any>;
}
