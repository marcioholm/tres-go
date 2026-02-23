import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(workspaceId: string, params: any) {
    return this.prisma.contact.findMany({
      where: {
        workspaceId,
        ...(params.search
          ? { name: { contains: params.search, mode: 'insensitive' } }
          : {}),
      },
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
    });
  }

  async findOne(workspaceId: string, id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
      include: {
        conversations: true,
        ContactToTag: { include: { Tag: true } },
        notes: true,
      },
    });
  }

  async create(workspaceId: string, data: any) {
    return this.prisma.contact.create({
      data: { ...data, workspaceId },
    });
  }

  async update(workspaceId: string, id: string, data: any, userId?: string) {
    const oldContact = await this.prisma.contact.findUnique({ where: { id } });
    const updatedContact = await this.prisma.contact.update({
      where: { id },
      data,
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

  async updateSource(
    workspaceId: string,
    id: string,
    sourceData: any,
    userId?: string,
  ) {
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
        referredBy: sourceData.referredBy,
      },
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

  async delete(workspaceId: string, id: string, userId?: string) {
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

  async addTag(workspaceId: string, contactId: string, tagId: string) {
    // Logic to add tag - assuming M-to-N relation
    return this.prisma.tag.update({
      where: { id: tagId },
      data: {
        ContactToTag: {
          create: {
            Contact: { connect: { id: contactId } },
          },
        },
      },
    });
  }

  async removeTag(workspaceId: string, contactId: string, tagId: string) {
    return this.prisma.contactToTag.deleteMany({
      where: {
        A: contactId,
        B: tagId,
      },
    });
  }

  async addNote(
    workspaceId: string,
    contactId: string,
    userId: string,
    content: string,
  ) {
    return this.prisma.contactNote.create({
      data: {
        contactId,
        agentId: userId, // Assuming userId is agentId
        content,
      },
    });
  }

  async getSourcesReport(workspaceId: string) {
    const sources = await this.prisma.contact.groupBy({
      by: ['source'],
      where: { workspaceId },
      _count: {
        source: true,
      },
    });

    return sources.map((s) => ({
      source: s.source || 'Direct/Unknown',
      count: s._count.source,
    }));
  }

  async importCsv(workspaceId: string, file: any) {
    // Mock CSV Import
    return { imported: 0, skipped: 0, errors: [] };
  }

  async bulkTagAction(
    workspaceId: string,
    data: { contactIds: string[]; tagId: string; action: 'add' | 'remove' },
  ) {
    const { contactIds, tagId, action } = data;

    if (action === 'add') {
      // Bulk add
      // We can't easily use createMany for many-to-many with explicit join table in one go if we want to avoid duplicates cleanly without skipping
      // But Prisma createMany on the join table works if we don't care about duplicates failing (or we filter first)

      // Safe approach: Find existing, filter, create missing
      const existing = await this.prisma.contactToTag.findMany({
        where: {
          A: { in: contactIds },
          B: tagId,
        },
        select: { A: true },
      });
      const existingIds = existing.map((e) => e.A);
      const toAdd = contactIds.filter((id) => !existingIds.includes(id));

      if (toAdd.length > 0) {
        await this.prisma.contactToTag.createMany({
          data: toAdd.map((contactId) => ({
            A: contactId,
            B: tagId,
          })),
        });
      }
      return { count: toAdd.length };
    } else {
      // Bulk remove
      const result = await this.prisma.contactToTag.deleteMany({
        where: {
          A: { in: contactIds },
          B: tagId,
        },
      });
      return { count: result.count };
    }
  }

  async findOrCreate(
    workspaceId: string,
    identifier: string,
    name?: string,
    avatarUrl?: string,
    handle?: string,
  ) {
    // Assume identifier is phone or external platform ID
    let contact = await this.prisma.contact.findFirst({
      where: {
        workspaceId,
        OR: [{ phone: identifier }, { externalId: identifier }],
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          workspaceId,
          name: name || identifier,
          phone: identifier,
          externalId: identifier,
          avatarUrl,
          handle,
        } as any,
      });
    } else {
      // Atualizar metadados do contato quando disponíveis
      const updates: any = {};
      const c = contact as any;
      // Atualizar nome se temos um nome real (não o IGSID/phone como fallback)
      if (name && name !== identifier && contact.name === identifier)
        updates.name = name;
      // Sempre atualizar avatar — URLs da Meta expiram
      if (avatarUrl) updates.avatarUrl = avatarUrl;
      // Preencher handle se estava vazio, ou se mudou
      if (handle && (!c.handle || c.handle !== handle)) updates.handle = handle;

      if (Object.keys(updates).length > 0) {
        contact = await this.prisma.contact.update({
          where: { id: contact.id },
          data: updates,
        });
      }
    }

    return contact;
  }
}
