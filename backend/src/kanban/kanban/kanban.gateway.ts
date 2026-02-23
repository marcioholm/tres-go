import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const workspaceId = client.handshake.query.workspaceId as string;
    if (workspaceId) {
      client.join(`workspace_${workspaceId}`);
      console.log(`Client ${client.id} joined workspace_${workspaceId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // handle disconnect
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  notifyBoardUpdate(workspaceId: string) {
    this.server.to(`workspace_${workspaceId}`).emit('board_updated');
  }
}
