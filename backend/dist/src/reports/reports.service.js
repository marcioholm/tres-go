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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics(workspaceId, range) {
        return {
            totalConversations: { value: 1284, change: 20.1 },
            resolved: { value: 1100, rate: 85 },
            newContacts: { value: 573, change: 201 },
            tma: { value: "4m 32s", change: -60 }
        };
    }
    async getAgentPerformance(workspaceId, range) {
        return [
            { name: "Alice", conversations: 120, resolved: 110, tma: "5m" },
            { name: "Bob", conversations: 98, resolved: 90, tma: "4m 30s" },
        ];
    }
    async getVolumeByDay(workspaceId, range) {
        return [
            { name: "Seg", total: 40 },
            { name: "Ter", total: 30 },
            { name: "Qua", total: 45 },
            { name: "Qui", total: 50 },
            { name: "Sex", total: 60 },
            { name: "Sab", total: 20 },
            { name: "Dom", total: 10 },
        ];
    }
    async getDashboard(workspaceId, startDate, endDate) {
        return {
            totalConversations: 120,
            resolvedConversations: 100,
            responseRate: '98%',
            avgResponseTime: '2m',
            avgResolutionTime: '15m',
            volumeByDay: []
        };
    }
    async getAgents(workspaceId, startDate, endDate) {
        return [
            { name: 'Agent Smith', total: 50, resolved: 48, rating: 4.9, status: 'ONLINE' }
        ];
    }
    async getSectorMetrics(workspaceId) {
        const sectors = await this.prisma.sector.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: {
                        conversations: true
                    }
                }
            }
        });
        return sectors.map(sector => ({
            id: sector.id,
            name: sector.name,
            color: sector.color,
            totalConversations: sector._count.conversations,
            openConversations: Math.floor(sector._count.conversations * 0.4),
            resolvedConversations: Math.floor(sector._count.conversations * 0.5),
            avgResponseTime: "5m",
            slaCompliance: "92%"
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map