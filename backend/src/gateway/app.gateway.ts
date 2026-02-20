import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.headers.authorization?.split(' ')[1];
            if (!token) throw new Error('No token');

            // const payload = this.jwtService.verify(token);
            // client.join(payload.workspaceId); // Default room

            const workspaceId = client.handshake.query.workspaceId as string;
            if (workspaceId) {
                client.join(workspaceId);
                console.log(`Client ${client.id} joined workspace ${workspaceId}`);
            }

        } catch (err) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client ${client.id} disconnected`);
    }

    // Helper to emit events to workspace
    emitToWorkspace(workspaceId: string, event: string, data: any) {
        this.server.to(workspaceId).emit(event, data);
    }

    @SubscribeMessage('joinSector')
    handleJoinSector(client: Socket, data: { workspaceId: string, sectorId: string }) {
        client.join(`${data.workspaceId}:sector:${data.sectorId}`);
        return { event: 'joinedSector', data: data.sectorId };
    }

    @SubscribeMessage('leaveSector')
    handleLeaveSector(client: Socket, data: { workspaceId: string, sectorId: string }) {
        client.leave(`${data.workspaceId}:sector:${data.sectorId}`);
        return { event: 'leftSector', data: data.sectorId };
    }

    emitToSector(workspaceId: string, sectorId: string, event: string, data: any) {
        this.server.to(`${workspaceId}:sector:${sectorId}`).emit(event, data);
        // Also emit to workspace for general visibility
        this.emitToWorkspace(workspaceId, event, data);
    }
}
