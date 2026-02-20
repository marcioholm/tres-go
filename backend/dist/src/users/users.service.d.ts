import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<{
        id: string;
        email: string;
        name: string;
    }[]>;
    update(id: string, data: any): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(email: string): Promise<{
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
        workspaces: {
            id: string;
            workspaceId: string;
            userId: string;
            role: string;
        }[];
    } & {
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOneById(id: string): Promise<{
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
        workspaces: {
            id: string;
            workspaceId: string;
            userId: string;
            role: string;
        }[];
    } & {
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: any): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
