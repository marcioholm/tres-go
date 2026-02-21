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
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
    }>;
    getUserProfile(userId: string): Promise<{
        isSuperAdmin: boolean;
        workspaces: {
            id: string;
            workspaceId: string;
            userId: string;
            role: string;
        }[];
        superAdmin: {
            id: string;
            createdAt: Date;
            userId: string;
        };
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
