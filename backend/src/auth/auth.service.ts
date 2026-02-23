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
  ) {}

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
      isSuperAdmin: !!user.superAdmin,
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
        isSuperAdmin: !!userData.superAdmin,
      },
    };
  }

  async register(registerDto: any) {
    const {
      workspaceName,
      taxId,
      email,
      password,
      firstName,
      lastName,
      niche,
    } = registerDto;

    let user;
    try {
      user = await this.usersService.create({
        email,
        password,
        firstName,
        lastName,
        niche,
      });
      console.log(
        `[Register] Usuário criado com sucesso: ${email} (ID: ${user.id})`,
      );
    } catch (err) {
      console.error(
        `[Register] Erro fatal ao criar usuário (${email}):`,
        err.message || err,
      );
      throw err;
    }

    // 2. Criar o workspace padrão (Processo crítico, mesmo sendo em bloco try)
    try {
      console.log(
        `[Register] Tentando criar workspace padrão para o usuário ${user.id}...`,
      );
      await this.workspacesService.createDefaultWorkspace(
        user.id,
        workspaceName,
        taxId,
      );
      console.log(
        `[Register] Workspace criado com sucesso para o usuário ${user.id}`,
      );
    } catch (err) {
      console.error(
        `[Register] Erro ao criar workspace inicial para ${user.id}:`,
        err.message || err,
      );
      // Se falhar aqui, o login() vai tentar criar novamente como fallback, o que é inseguro mas mantém a continuidade.
      // O ideal agora é re-buscar o usuário com as relações devidamente carregadas.
    }

    // 3. Buscar usuário atualizado com as relações (workspaces) para evitar criação duplicada no login()
    const updatedUser = await this.usersService.findOneById(user.id);

    // 4. Retornar o usuário com token para login automático no frontend
    return this.login(updatedUser || user);
  }
}
