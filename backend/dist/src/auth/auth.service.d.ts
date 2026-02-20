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
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserProfile(userId: string): Promise<{
        isSuperAdmin: boolean;
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
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: any): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
