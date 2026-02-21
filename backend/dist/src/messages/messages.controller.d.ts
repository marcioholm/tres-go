import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAll(workspaceId: string, conversationId: string, cursor?: string): Promise<any[]>;
    create(workspaceId: string, createMessageDto: SendMessageDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        externalId: string | null;
        conversationId: string;
        fromAgent: boolean;
        isInternalNote: boolean;
    }>;
}
