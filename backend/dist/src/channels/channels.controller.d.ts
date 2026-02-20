import { ChannelsService } from './channels.service';
export declare class ChannelsController {
    private readonly channelsService;
    constructor(channelsService: ChannelsService);
    create(workspaceId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        isActive: boolean;
        config: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }>;
    findAll(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        name: string;
        isActive: boolean;
        config: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }[]>;
}
