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
exports.ChannelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_service_1 = require("../billing/billing.service");
let ChannelsService = class ChannelsService {
    constructor(prisma, billing) {
        this.prisma = prisma;
        this.billing = billing;
    }
    async create(workspaceId, data) {
        const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
        if (!limitInfo.allowed) {
            throw new Error(`Limite de canais (${limitInfo.limit}) atingido para o seu plano.`);
        }
        return this.prisma.channel.create({
            data: {
                ...data,
                workspaceId,
                config: data.config || {},
                isActive: true,
            },
        });
    }
    async findAll(workspaceId) {
        return this.prisma.channel.findMany({
            where: { workspaceId },
        });
    }
};
exports.ChannelsService = ChannelsService;
exports.ChannelsService = ChannelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        billing_service_1.BillingService])
], ChannelsService);
//# sourceMappingURL=channels.service.js.map