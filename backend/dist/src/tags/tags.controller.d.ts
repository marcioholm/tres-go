import { TagsService } from './tags.service';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }[]>;
    create(workspaceId: string, data: {
        name: string;
        color: string;
    }): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    update(workspaceId: string, id: string, data: any): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
}
