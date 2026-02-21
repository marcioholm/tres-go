import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        email: string;
        firstName: string;
        lastName: string;
        niche: string;
    }[]>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
    }>;
    findOne(email: string): Promise<{
        workspaces: {
            id: string;
            userId: string;
            workspaceId: string;
            role: string;
        }[];
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
    }>;
    findOneById(id: string): Promise<{
        workspaces: {
            id: string;
            userId: string;
            workspaceId: string;
            role: string;
        }[];
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
    }>;
    create(data: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
    }>;
}
