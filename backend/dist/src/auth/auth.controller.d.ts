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
    getProfile(req: any): Promise<{
        isSuperAdmin: boolean;
        workspaces: {
            id: string;
            role: string;
            userId: string;
            workspaceId: string;
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
    updateStatus(req: any, status: string): Promise<{
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
