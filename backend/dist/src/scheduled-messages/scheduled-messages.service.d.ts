import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class ScheduledMessagesService {
    private scheduledMessagesQueue;
    private prisma;
    constructor(scheduledMessagesQueue: Queue, prisma: PrismaService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        workspaceId: string;
        agentId: string;
        channelId: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        conversationId: string;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }>;
    findAll(workspaceId: string, conversationId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        workspaceId: string;
        agentId: string;
        channelId: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        conversationId: string;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }[]>;
    cancel(workspaceId: string, id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        workspaceId: string;
        agentId: string;
        channelId: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        conversationId: string;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }>;
}
