import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAcceptance(
    userId: string,
    data: {
      termsVersion: string;
      privacyVersion: string;
      ip?: string;
      userAgent?: string;
    },
  ) {
    return this.prisma.legalAcceptance.upsert({
      where: { userId },
      update: { ...data, acceptedAt: new Date() },
      create: { userId, ...data },
    });
  }

  async getAcceptance(userId: string) {
    return this.prisma.legalAcceptance.findUnique({ where: { userId } });
  }
}
