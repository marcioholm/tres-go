import { Controller, Get, Query, Res, Redirect } from '@nestjs/common';
import { Response } from 'express';
import { MetaIntegrationService } from './meta-integration.service';

@Controller()
export class MetaIntegrationController {
  constructor(private readonly metaService: MetaIntegrationService) {}

  // ─── HTML PAGES ──────────────────────────────────────────────────────────

  @Get('integrations/meta')
  getLanding(@Query('workspaceId') workspaceId: string, @Res() res: Response) {
    this.setSecurityHeaders(res);
    return res.send(this.metaService.renderLandingPage(workspaceId));
  }

  @Get('integrations/meta/success')
  getSuccess(
    @Query('pageName') pageName: string,
    @Query('pageId') pageId: string,
    @Query('igId') igId: string,
    @Query('workspaceId') workspaceId: string,
    @Res() res: Response,
  ) {
    this.setSecurityHeaders(res);
    return res.send(
      this.metaService.renderSuccessPage({
        pageName,
        pageId,
        igAccountId: igId || null,
        workspaceId,
      }),
    );
  }

  @Get('integrations/meta/error')
  getError(
    @Query('reason') reason: string,
    @Query('details') details: string,
    @Res() res: Response,
  ) {
    this.setSecurityHeaders(res);
    return res.send(this.metaService.renderErrorPage(reason, details));
  }

  // ─── OAUTH LOGIC ─────────────────────────────────────────────────────────

  @Get('auth/meta/login')
  @Redirect()
  login(@Query('workspaceId') workspaceId: string) {
    if (!process.env.META_APP_ID || !process.env.META_REDIRECT_URI) {
      return { url: '/integrations/meta/error?reason=missing_env' };
    }
    return { url: this.metaService.getLoginUrl(workspaceId) };
  }

  @Get('auth/meta/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') fbError: string,
    @Res() res: Response,
  ) {
    this.setSecurityHeaders(res);

    if (fbError) {
      return res.redirect(
        `/integrations/meta/error?reason=denied&details=${fbError}`,
      );
    }

    const workspaceId = this.metaService.validateState(state);
    if (!code || !state || !workspaceId) {
      return res.redirect('/integrations/meta/error?reason=invalid_state');
    }

    try {
      const integration = await this.metaService.handleCallback(
        code,
        workspaceId,
      );
      return res.redirect(
        `/integrations/meta/success?pageName=${encodeURIComponent(integration.pageName)}&pageId=${integration.pageId}&igId=${integration.igBusinessAccountId || ''}&workspaceId=${workspaceId}`,
      );
    } catch (error) {
      console.error('Meta Callback Error:', error);
      return res.redirect(
        `/integrations/meta/error?reason=generic&details=${encodeURIComponent(error.message)}`,
      );
    }
  }

  private setSecurityHeaders(res: Response) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
  }
}
