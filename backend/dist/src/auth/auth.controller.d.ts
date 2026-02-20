import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
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
    getProfile(req: any): Promise<{
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
    updateStatus(req: any, status: string): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
