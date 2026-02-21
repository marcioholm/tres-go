import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { WorkspacesService } from '../workspaces/workspaces.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private workspacesService;
    constructor(usersService: UsersService, jwtService: JwtService, workspacesService: WorkspacesService);
    validateUser(email: string, pass: string): Promise<any>;
    updateStatus(userId: string, status: string): Promise<{
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
    getUserProfile(userId: string): Promise<{
        isSuperAdmin: boolean;
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
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: any): Promise<{
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
