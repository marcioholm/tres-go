import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceBlockMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // Extrair workspaceId da rota (/workspaces/:workspaceId/...)
        // Pode vir de params, ou de param regex, dependendo da rota
        // Geralmente as rotas do workspace são prefixadas com algo que tem workspaceId, 
        // Vamos garantir pegando os parâmetros disponíveis, ou validando na URL
        const urlParts = req.originalUrl.split('?')[0].split('/');
        const workspaceIdIndex = urlParts.indexOf('workspaces') + 1;
        const workspaceId = workspaceIdIndex > 0 ? urlParts[workspaceIdIndex] : null;

        if (!workspaceId || workspaceId.length < 5) return next();

        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { isBlocked: true, blockReason: true },
        });

        if (workspace?.isBlocked) {
            return res.status(402).json({
                statusCode: 402,
                error: 'Payment Required',
                message: workspace.blockReason || 'Conta bloqueada. Entre em contato com o suporte.',
                blocked: true,
            });
        }

        next();
    }
}
