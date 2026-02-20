import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async findAll(workspaceId: string) {
        return this.prisma.tag.findMany({ where: { workspaceId } });
    }

    async create(workspaceId: string, name: string, color: string) {
        return this.prisma.tag.create({
            data: { workspaceId, name, color }
        });
    }

    async update(workspaceId: string, id: string, name?: string, color?: string) {
        return this.prisma.tag.update({
            where: { id },
            data: { name, color }
        });
    }

    async delete(workspaceId: string, id: string) {
        return this.prisma.tag.delete({ where: { id } });
    }
}
