import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private workspacesService: WorkspacesService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async updateStatus(userId: string, status: string) {
        return this.usersService.update(userId, { status });
    }

    async getUserProfile(userId: string) {
        let user = await this.usersService.findOneById(userId);

        // Self-healing: Ensure user has a workspace
        if (!user.workspaces || user.workspaces.length === 0) {
            await this.workspacesService.createDefaultWorkspace(userId);
            // Re-fetch user with new workspace
            user = await this.usersService.findOneById(userId);
        }

        return {
            ...user,
            isSuperAdmin: !!user.superAdmin
        };
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };

        let userData = user;

        if (!userData.workspaces || userData.workspaces.length === 0) {
            try {
                await this.workspacesService.createDefaultWorkspace(userData.id);
                userData = await this.usersService.findOneById(userData.id);
            } catch (err) {
                // Handle error silently or log properly if needed, but for now remove debug noise
            }
        }

        const { password, ...safeUser } = userData;

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...safeUser,
                isSuperAdmin: !!userData.superAdmin
            }
        };
    }

    async register(registerDto: any) {
        const { workspaceName, taxId, ...userData } = registerDto;

        // 1. Criar o usuário
        const user = await this.usersService.create(userData);

        // 2. Criar o workspace padrão (ignorar falhas não críticas para não bloquear o registro)
        try {
            await this.workspacesService.createDefaultWorkspace(user.id, workspaceName, taxId);
        } catch (err) {
            console.error("Falha ao criar workspace no registro:", err);
            // Mesmo se falhar o workspace, o self-healing no login/perfil deve lidar com isso depois
        }

        // 3. Retornar o usuário com token para login automático no frontend
        return this.login(user);
    }
}
