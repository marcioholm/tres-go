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
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(req: any): Promise<{
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
        email: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(req: any, status: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        niche: string | null;
        password: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
