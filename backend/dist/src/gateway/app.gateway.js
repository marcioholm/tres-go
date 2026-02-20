"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
let AppGateway = class AppGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.headers.authorization?.split(' ')[1];
            if (!token)
                throw new Error('No token');
            const workspaceId = client.handshake.query.workspaceId;
            if (workspaceId) {
                client.join(workspaceId);
                console.log(`Client ${client.id} joined workspace ${workspaceId}`);
            }
        }
        catch (err) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client ${client.id} disconnected`);
    }
    emitToWorkspace(workspaceId, event, data) {
        this.server.to(workspaceId).emit(event, data);
    }
    handleJoinSector(client, data) {
        client.join(`${data.workspaceId}:sector:${data.sectorId}`);
        return { event: 'joinedSector', data: data.sectorId };
    }
    handleLeaveSector(client, data) {
        client.leave(`${data.workspaceId}:sector:${data.sectorId}`);
        return { event: 'leftSector', data: data.sectorId };
    }
    emitToSector(workspaceId, sectorId, event, data) {
        this.server.to(`${workspaceId}:sector:${sectorId}`).emit(event, data);
        this.emitToWorkspace(workspaceId, event, data);
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinSector'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleJoinSector", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveSector'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleLeaveSector", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map