import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('workspaces/:workspaceId/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  findAll(@Param('workspaceId') workspaceId: string) {
    return this.usersService.findAll(workspaceId);
  }

  @Patch('me/acknowledge-welcome')
  acknowledgeWelcome(@Request() req: any) {
    return this.usersService.update(req.user.id, { welcomeShown: true });
  }
}
