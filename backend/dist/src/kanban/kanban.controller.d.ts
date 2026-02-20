import { KanbanService } from './kanban.service';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
    getBoard(workspaceId: string): Promise<{
        columns: ({
            deals: ({
                contact: {
                    id: string;
                    email: string | null;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    workspaceId: string;
                    phone: string | null;
                    source: import(".prisma/client").$Enums.TrafficSource | null;
                    sourceMedium: string | null;
                    sourceCampaign: string | null;
                    sourceContent: string | null;
                    utmSource: string | null;
                    utmMedium: string | null;
                    utmCampaign: string | null;
                    referredBy: string | null;
                };
                agent: {
                    id: string;
                    email: string;
                    name: string;
                    password: string;
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
                tags: ({
                    tag: {
                        id: string;
                        name: string;
                        workspaceId: string | null;
                        color: string | null;
                        type: import(".prisma/client").$Enums.TagType;
                    };
                } & {
                    tagId: string;
                    dealId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                workspaceId: string;
                order: number;
                agentId: string | null;
                contactId: string;
                value: number | null;
                conversationId: string | null;
                notes: string | null;
                title: string;
                columnId: string;
                expectedCloseAt: Date | null;
                closedAt: Date | null;
            })[];
        } & {
            id: string;
            name: string;
            color: string;
            order: number;
            isWon: boolean;
            isLost: boolean;
            boardId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        sectorId: string | null;
    }>;
    createDeal(workspaceId: string, data: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        order: number;
        agentId: string | null;
        contactId: string;
        value: number | null;
        conversationId: string | null;
        notes: string | null;
        title: string;
        columnId: string;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    updateDeal(workspaceId: string, id: string, data: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        order: number;
        agentId: string | null;
        contactId: string;
        value: number | null;
        conversationId: string | null;
        notes: string | null;
        title: string;
        columnId: string;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    deleteDeal(workspaceId: string, id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        order: number;
        agentId: string | null;
        contactId: string;
        value: number | null;
        conversationId: string | null;
        notes: string | null;
        title: string;
        columnId: string;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    updateColumn(workspaceId: string, id: string, data: any, req: any): Promise<{
        id: string;
        name: string;
        color: string;
        order: number;
        isWon: boolean;
        isLost: boolean;
        boardId: string;
    }>;
}
