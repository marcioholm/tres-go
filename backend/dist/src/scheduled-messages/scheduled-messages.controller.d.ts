import { ScheduledMessagesService } from './scheduled-messages.service';
export declare class ScheduledMessagesController {
    private readonly scheduledMessagesService;
    constructor(scheduledMessagesService: ScheduledMessagesService);
    create(workspaceId: string, createScheduledMessageDto: any): Promise<{
        id: string;
        workspaceId: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        conversationId: string;
        agentId: string;
        type: string;
        channelId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }>;
    findAll(workspaceId: string, conversationId?: string): Promise<{
        id: string;
        workspaceId: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        conversationId: string;
        agentId: string;
        type: string;
        channelId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }[]>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        workspaceId: string;
        status: import(".prisma/client").$Enums.ScheduledStatus;
        createdAt: Date;
        conversationId: string;
        agentId: string;
        type: string;
        channelId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        scheduledAt: Date;
        sentAt: Date | null;
        errorMessage: string | null;
    }>;
}
