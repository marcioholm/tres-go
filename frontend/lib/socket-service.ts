import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ||
    (process.env.NEXT_PUBLIC_API_URL ?
        process.env.NEXT_PUBLIC_API_URL.replace('/api', '').replace('http', 'ws') :
        "http://localhost:3001");

console.log(`[Socket] Connecting to: ${SOCKET_URL}`);

class SocketService {
    private socket: Socket | null = null;

    getSocket(workspaceId?: string): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 10,
                query: workspaceId ? { workspaceId } : undefined
            });

            this.socket.on('connect', () => {
                console.log('[Socket] Connected to server');
            });

            this.socket.on('disconnect', () => {
                console.log('[Socket] Disconnected from server');
            });
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
