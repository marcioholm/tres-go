import { Controller, Post, Body, Get, UseGuards, Request, Param, Delete, Patch, Query, Res } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { AuthGuard } from '@nestjs/passport';
import { MetaOAuthService } from './meta-oauth.service';
import { Response } from 'express';

@Controller('workspaces/:workspaceId/channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly metaOAuth: MetaOAuthService,
    ) { }

    @Post()
    create(@Param('workspaceId') workspaceId: string, @Body() data: any) {
        return this.channelsService.create(workspaceId, data);
    }

    @Get()
    findAll(@Param('workspaceId') workspaceId: string) {
        return this.channelsService.findAll(workspaceId);
    }

    @Patch(':id')
    update(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.channelsService.update(id, data, workspaceId);
    }

    @Delete(':id')
    remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
        return this.channelsService.remove(id, workspaceId);
    }

    // --- Meta OAuth (Instagram / Messenger) ---

    @Get('oauth/meta')
    getMetaOAuthUrl(
        @Param('workspaceId') workspaceId: string,
        @Query('type') type: 'INSTAGRAM' | 'MESSENGER',
        @Query('name') name: string,
    ) {
        return this.metaOAuth.generateOAuthUrl(type, workspaceId, name);
    }

    @Get('oauth/meta/callback')
    async metaCallback(@Query('code') code: string, @Res() res: Response) {
        const { pages } = await this.metaOAuth.exchangeCodeForToken(code);
        const sessionKey = await this.channelsService.storePageSession(pages);
        // Redirecionar para o frontend com a chave da sessão
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/configuracoes/canais/callback?key=${sessionKey}`);
    }

    @Get('oauth/meta/pages')
    async getMetaPages(@Query('key') key: string) {
        const pages = await this.channelsService.getPageSession(key);
        if (!pages) throw new NotFoundException('Sessão expirada ou inválida');
        return pages;
    }

    // --- WhatsApp ---

    @Post('whatsapp/request-code')
    requestWhatsAppCode(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { phoneNumber: string; method: 'SMS' | 'VOICE'; channelName: string },
    ) {
        return this.channelsService.requestWhatsAppCode(body, workspaceId);
    }

    @Post('whatsapp/verify-code')
    verifyWhatsAppCode(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { channelId: string; code: string },
    ) {
        return this.channelsService.verifyWhatsAppCode(body, workspaceId);
    }
}
