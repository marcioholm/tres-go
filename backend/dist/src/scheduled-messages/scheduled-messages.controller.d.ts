import { ScheduledMessagesService } from './scheduled-messages.service';
export declare class ScheduledMessagesController {
    private readonly scheduledMessagesService;
    constructor(scheduledMessagesService: ScheduledMessagesService);
    create(workspaceId: string, createScheduledMessageDto: any): Promise<{
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
    remove(workspaceId: string, id: string): Promise<{
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
