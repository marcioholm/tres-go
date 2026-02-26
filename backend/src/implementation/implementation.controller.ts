import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ImplementationService } from './implementation.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('implementation')
@UseGuards(JwtAuthGuard)
export class ImplementationController {
    constructor(private readonly implementationService: ImplementationService) { }

    @Post('workspaces/:workspaceId/order')
    async createOrder(@Param('workspaceId') workspaceId: string) {
        return this.implementationService.createOrder(workspaceId);
    }

    @Get('workspaces/:workspaceId/order')
    async getOrder(@Param('workspaceId') workspaceId: string) {
        return this.implementationService.getOrder(workspaceId);
    }

    // Admin endpoints (should ideally have a RoleGuard too)
    @Get('admin')
    async listAll(@Query('status') status: string) {
        return this.implementationService.listAll(status);
    }

    @Patch('admin/:id/schedule')
    async schedule(@Param('id') id: string, @Body('scheduledAt') scheduledAt: string) {
        return this.implementationService.schedule(id, new Date(scheduledAt));
    }

    @Patch('admin/:id/complete')
    async complete(@Param('id') id: string, @Body('notes') notes: string) {
        return this.implementationService.complete(id, notes);
    }
}
