import { PrismaService } from '../prisma/prisma.service';
export declare class ArchiveService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleDataArchiving(): Promise<void>;
}
