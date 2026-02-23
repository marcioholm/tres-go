import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuickReplyService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(workspaceId: string) {
        return this.prisma.quickReply.findMany({
            where: { workspaceId },
            orderBy: { command: 'asc' },
        });
    }

    async create(workspaceId: string, dto: any) {
        return this.prisma.quickReply.create({
            data: {
                workspaceId,
                command: dto.command.startsWith('/') ? dto.command : `/${dto.command}`,
                title: dto.title,
                content: dto.content,
                category: dto.category,
            },
        });
    }

    async update(id: string, workspaceId: string, dto: any) {
        return this.prisma.quickReply.update({
            where: { id, workspaceId },
            data: {
                command: dto.command,
                title: dto.title,
                content: dto.content,
                category: dto.category,
            },
        });
    }

    async remove(id: string, workspaceId: string) {
        return this.prisma.quickReply.delete({
            where: { id, workspaceId },
        });
    }
}
