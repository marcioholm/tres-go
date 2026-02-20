import {
    Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, Res
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
    constructor(private superAdminService: SuperAdminService) { }

    @Get('dashboard')
    async getDashboard() {
        return this.superAdminService.getDashboardMetrics();
    }

    // ── Workspaces ─────────────────────────────────────────────────────────────

    @Get('workspaces')
    async getWorkspaces(@Query() query: any) {
        return this.superAdminService.getWorkspaces(query);
    }

    @Get('workspaces/:id')
    async getWorkspaceDetails(@Param('id') id: string) {
        return this.superAdminService.getWorkspaceDetails(id);
    }

    @Post('workspaces/:id/block')
    async blockWorkspace(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @Request() req: any
    ) {
        return this.superAdminService.blockWorkspace(id, reason || 'Ação do Super Admin', req.user.sub);
    }

    @Post('workspaces/:id/unblock')
    async unblockWorkspace(
        @Param('id') id: string,
        @Request() req: any
    ) {
        return this.superAdminService.unblockWorkspace(id, req.user.sub);
    }

    @Put('workspaces/:id/plan')
    async changeWorkspacePlan(
        @Param('id') id: string,
        @Body('planSlug') planSlug: string
    ) {
        return this.superAdminService.changeWorkspacePlan(id, planSlug);
    }

    @Delete('workspaces/:id')
    async deleteWorkspace(
        @Param('id') id: string,
        @Request() req: any
    ) {
        return this.superAdminService.deleteWorkspace(id, req.user.sub);
    }

    // ── Plans ──────────────────────────────────────────────────────────────────

    @Get('plans')
    async getPlans() {
        return this.superAdminService.getPlans();
    }

    @Post('plans')
    async createPlan(@Body() data: any) {
        return this.superAdminService.createPlan(data);
    }

    @Put('plans/:id')
    async updatePlan(@Param('id') id: string, @Body() data: any) {
        return this.superAdminService.updatePlan(id, data);
    }

    @Get('users')
    async getAllUsers(@Query('search') search: string) {
        return this.superAdminService.getAllUsers(search);
    }

    @Get('health')
    async getHealth() {
        return this.superAdminService.getSystemHealth();
    }

    // ── Admins ─────────────────────────────────────────────────────────────────

    @Get('admins')
    async getAdmins() {
        return this.superAdminService.getAdmins();
    }

    @Post('admins/:userId')
    async promoteToAdmin(@Param('userId') userId: string) {
        return this.superAdminService.promoteToAdmin(userId);
    }

    @Delete('admins/:id')
    async revokeAdmin(@Param('id') id: string) {
        return this.superAdminService.revokeAdmin(id);
    }

    // ── Reports & Audit ─────────────────────────────────────────────────────────

    @Get('reports/financial')
    async getFinancialReports(@Query() query: any) {
        return this.superAdminService.getFinancialReports(query);
    }

    @Get('audit-logs')
    async getAuditLogs(@Query() query: any) {
        return this.superAdminService.getAuditLogs(query);
    }

    @Get('export/users')
    async exportUsers(@Res() res) {
        const csv = await this.superAdminService.exportUsersToCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        return res.send(csv);
    }

    @Get('export/contacts')
    async exportContacts(@Res() res) {
        const csv = await this.superAdminService.exportContactsToCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
        return res.send(csv);
    }
}

