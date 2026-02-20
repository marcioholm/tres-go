import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LegalService } from './legal.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Request } from 'express';

@Controller('legal')
export class LegalController {
    constructor(private readonly legalService: LegalService) { }

    @Post('accept')
    @UseGuards(JwtAuthGuard)
    async acceptTerms(
        @Req() req: any,
        @Body() body: { termsVersion: string; privacyVersion: string },
    ) {
        const userId = req.user.id || req.user.sub;
        return this.legalService.recordAcceptance(userId, {
            termsVersion: body.termsVersion || '1.0',
            privacyVersion: body.privacyVersion || '1.0',
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    }

    @Get('acceptance')
    @UseGuards(JwtAuthGuard)
    async getAcceptance(@Req() req: any) {
        const userId = req.user.id || req.user.sub;
        return this.legalService.getAcceptance(userId);
    }
}
