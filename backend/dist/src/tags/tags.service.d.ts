import { PrismaService } from '../prisma/prisma.service';
export declare class TagsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }[]>;
    create(workspaceId: string, name: string, color: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    update(workspaceId: string, id: string, name?: string, color?: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
    delete(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        workspaceId: string | null;
        color: string | null;
        type: import(".prisma/client").$Enums.TagType;
    }>;
}
