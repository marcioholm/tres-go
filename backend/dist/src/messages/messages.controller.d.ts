import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAll(workspaceId: string, conversationId: string, cursor?: string): Promise<any[]>;
    create(workspaceId: string, createMessageDto: SendMessageDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        conversationId: string;
        fromAgent: boolean;
        isInternalNote: boolean;
        externalId: string | null;
    }>;
}
