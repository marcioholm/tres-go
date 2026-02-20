import { KanbanService } from './kanban.service';
export declare class KanbanController {
    private readonly kanbanService;
    constructor(kanbanService: KanbanService);
    getBoard(workspaceId: string): Promise<{
        columns: ({
            deals: ({
                contact: {
                    id: string;
                    workspaceId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    email: string | null;
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
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    email: string;
                    password: string;
                };
                tags: ({
                    tag: {
                        id: string;
                        workspaceId: string | null;
                        name: string;
                        color: string | null;
                        type: import(".prisma/client").$Enums.TagType;
                    };
                } & {
                    dealId: string;
                    tagId: string;
                })[];
            } & {
                id: string;
                workspaceId: string;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                contactId: string;
                columnId: string;
                conversationId: string | null;
                title: string;
                value: number | null;
                agentId: string | null;
                notes: string | null;
                expectedCloseAt: Date | null;
                closedAt: Date | null;
            })[];
        } & {
            id: string;
            name: string;
            order: number;
            boardId: string;
            color: string;
            isWon: boolean;
            isLost: boolean;
        })[];
    } & {
        id: string;
        workspaceId: string;
        createdAt: Date;
        name: string;
        sectorId: string | null;
    }>;
    createDeal(workspaceId: string, data: any, req: any): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        contactId: string;
        columnId: string;
        conversationId: string | null;
        title: string;
        value: number | null;
        agentId: string | null;
        notes: string | null;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    updateDeal(workspaceId: string, id: string, data: any, req: any): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        contactId: string;
        columnId: string;
        conversationId: string | null;
        title: string;
        value: number | null;
        agentId: string | null;
        notes: string | null;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    deleteDeal(workspaceId: string, id: string, req: any): Promise<{
        id: string;
        workspaceId: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        contactId: string;
        columnId: string;
        conversationId: string | null;
        title: string;
        value: number | null;
        agentId: string | null;
        notes: string | null;
        expectedCloseAt: Date | null;
        closedAt: Date | null;
    }>;
    updateColumn(workspaceId: string, id: string, data: any, req: any): Promise<{
        id: string;
        name: string;
        order: number;
        boardId: string;
        color: string;
        isWon: boolean;
        isLost: boolean;
    }>;
}
