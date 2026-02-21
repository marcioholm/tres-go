import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string, conversationId: string, cursor?: string): Promise<any[]>;
    create(workspaceId: string, data: SendMessageDto): Promise<{
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
    private sendViaWhatsappOfficial;
    private sendViaZapi;
}
