import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string, conversationId: string, cursor?: string): Promise<any[]>;
    create(workspaceId: string, data: SendMessageDto): Promise<{
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
    private sendViaWhatsappOfficial;
    private sendViaZapi;
}
