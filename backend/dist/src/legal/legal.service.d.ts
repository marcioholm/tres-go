import { PrismaService } from '../prisma/prisma.service';
export declare class LegalService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recordAcceptance(userId: string, data: {
        termsVersion: string;
        privacyVersion: string;
        ip?: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        userId: string;
        ip: string | null;
        termsVersion: string;
        privacyVersion: string;
        acceptedAt: Date;
        userAgent: string | null;
    }>;
    getAcceptance(userId: string): Promise<{
        id: string;
        userId: string;
        ip: string | null;
        termsVersion: string;
        privacyVersion: string;
        acceptedAt: Date;
        userAgent: string | null;
    }>;
}
