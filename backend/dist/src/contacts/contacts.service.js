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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let ContactsService = class ContactsService {
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async findAll(workspaceId, params) {
        return this.prisma.contact.findMany({
            where: {
                workspaceId,
                ...(params.search ? { name: { contains: params.search, mode: 'insensitive' } } : {})
            },
            take: params.limit,
            skip: params.cursor ? 1 : 0,
            cursor: params.cursor ? { id: params.cursor } : undefined,
        });
    }
    async findOne(workspaceId, id) {
        return this.prisma.contact.findUnique({
            where: { id },
            include: { conversations: true, ContactToTag: { include: { Tag: true } }, notes: true },
        });
    }
    async create(workspaceId, data) {
        return this.prisma.contact.create({
            data: { ...data, workspaceId }
        });
    }
    async update(workspaceId, id, data, userId) {
        const oldContact = await this.prisma.contact.findUnique({ where: { id } });
        const updatedContact = await this.prisma.contact.update({
            where: { id },
            data
        });
        await this.auditLogsService.logEvent({
            workspaceId,
            userId,
            actionType: 'CONTACT_UPDATED',
            entityType: 'Contact',
            entityId: id,
            oldValue: oldContact,
            newValue: updatedContact,
        });
        return updatedContact;
    }
    async updateSource(workspaceId, id, sourceData, userId) {
        const oldContact = await this.prisma.contact.findUnique({ where: { id } });
        const updatedContact = await this.prisma.contact.update({
            where: { id },
            data: {
                source: sourceData.source,
                sourceMedium: sourceData.sourceMedium,
                sourceCampaign: sourceData.sourceCampaign,
                sourceContent: sourceData.sourceContent,
                utmSource: sourceData.utmSource,
                utmMedium: sourceData.utmMedium,
                utmCampaign: sourceData.utmCampaign,
                referredBy: sourceData.referredBy
            }
        });
        await this.auditLogsService.logEvent({
            workspaceId,
            userId,
            actionType: 'CONTACT_SOURCE_UPDATED',
            entityType: 'Contact',
            entityId: id,
            oldValue: oldContact,
            newValue: updatedContact,
        });
        return updatedContact;
    }
    async delete(workspaceId, id, userId) {
        const oldContact = await this.prisma.contact.findUnique({ where: { id } });
        const deletedContact = await this.prisma.contact.delete({ where: { id } });
        if (oldContact) {
            await this.auditLogsService.logEvent({
                workspaceId,
                userId,
                actionType: 'CONTACT_DELETED',
                entityType: 'Contact',
                entityId: id,
                oldValue: oldContact,
            });
        }
        return deletedContact;
    }
    async addTag(workspaceId, contactId, tagId) {
        return this.prisma.tag.update({
            where: { id: tagId },
            data: {
                ContactToTag: {
                    create: {
                        Contact: { connect: { id: contactId } }
                    }
                }
            }
        });
    }
    async removeTag(workspaceId, contactId, tagId) {
        return this.prisma.contactToTag.deleteMany({
            where: {
                A: contactId,
                B: tagId
            }
        });
    }
    async addNote(workspaceId, contactId, userId, content) {
        return this.prisma.contactNote.create({
            data: {
                contactId,
                agentId: userId,
                content
            }
        });
    }
    async getSourcesReport(workspaceId) {
        const sources = await this.prisma.contact.groupBy({
            by: ['source'],
            where: { workspaceId },
            _count: {
                source: true
            }
        });
        return sources.map(s => ({
            source: s.source || 'Direct/Unknown',
            count: s._count.source
        }));
    }
    async importCsv(workspaceId, file) {
        return { imported: 0, skipped: 0, errors: [] };
    }
    async bulkTagAction(workspaceId, data) {
        const { contactIds, tagId, action } = data;
        if (action === 'add') {
            const existing = await this.prisma.contactToTag.findMany({
                where: {
                    A: { in: contactIds },
                    B: tagId
                },
                select: { A: true }
            });
            const existingIds = existing.map(e => e.A);
            const toAdd = contactIds.filter(id => !existingIds.includes(id));
            if (toAdd.length > 0) {
                await this.prisma.contactToTag.createMany({
                    data: toAdd.map(contactId => ({
                        A: contactId,
                        B: tagId
                    }))
                });
            }
            return { count: toAdd.length };
        }
        else {
            const result = await this.prisma.contactToTag.deleteMany({
                where: {
                    A: { in: contactIds },
                    B: tagId
                }
            });
            return { count: result.count };
        }
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map