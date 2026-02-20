import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitToWorkspace(workspaceId: string, event: string, data: any): void;
    handleJoinSector(client: Socket, data: {
        workspaceId: string;
        sectorId: string;
    }): {
        event: string;
        data: string;
    };
    handleLeaveSector(client: Socket, data: {
        workspaceId: string;
        sectorId: string;
    }): {
        event: string;
        data: string;
    };
    emitToSector(workspaceId: string, sectorId: string, event: string, data: any): void;
}
