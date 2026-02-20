import { ChannelsService } from './channels.service';
export declare class ChannelsController {
    private readonly channelsService;
    constructor(channelsService: ChannelsService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        isActive: boolean;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        isActive: boolean;
        type: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
