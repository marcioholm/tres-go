import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(workspaceId: string) {
    return this.prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            workspaceId
          }
        }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        niche: true,
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { workspaces: true, superAdmin: true }
    });
    return user;
  }

  async findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { workspaces: true, superAdmin: true }
    });
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }
}
