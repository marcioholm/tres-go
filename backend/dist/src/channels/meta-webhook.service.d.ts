import { PrismaService } from '../prisma/prisma.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
export declare class MetaWebhookService {
    private readonly prisma;
    private readonly contactsService;
    private readonly conversationsService;
    private readonly messagesService;
    constructor(prisma: PrismaService, contactsService: ContactsService, conversationsService: ConversationsService, messagesService: MessagesService);
    validateSignature(body: any, signature: string): boolean;
    processWebhook(body: any): Promise<void>;
    private handleIncomingMessage;
    private handleWhatsAppWebhook;
    private handleMessageRead;
    private handleMessageDelivery;
}
