import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(registerDto: any): Promise<{
        access_token: string;
        user: any;
    }>;
    getProfile(req: any): Promise<{
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
    updateStatus(req: any, status: string): Promise<{
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
}
