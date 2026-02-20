import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(client: any, payload: any): string;
    notifyBoardUpdate(workspaceId: string): void;
}
