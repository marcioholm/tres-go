import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    if (!user || !user.sub) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId: user.sub },
    });

    if (!superAdmin) {
      throw new UnauthorizedException(
        'Acesso restrito a Super Administradores',
      );
    }

    return true;
  }
}
