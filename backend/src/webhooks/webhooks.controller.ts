import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('whatsapp/:phoneNumberId')
  verifyWhatsapp(
    @Param('phoneNumberId') phoneNumberId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    // TODO: Verify token against workspace config
    if (mode === 'subscribe' && token === 'northway_omni_token') {
      console.log('Webhook verified for', phoneNumberId);
      return res.status(HttpStatus.OK).send(challenge);
    }
    return res.status(HttpStatus.FORBIDDEN).send();
  }

  @Post('whatsapp/:phoneNumberId')
  async handleWhatsappMessage(
    @Param('phoneNumberId') phoneNumberId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    console.log('Received WhatsApp message for', phoneNumberId);

    // TODO: Resolve workspaceId from phoneNumberId
    const workspaceId = 'default-workspace-id'; // Placeholder

    await this.webhooksService.processWhatsappMessage(workspaceId, body);
    return res.status(HttpStatus.OK).send('EVENT_RECEIVED');
  }

  async handleZapiMessage(
    @Param('instanceId') instanceId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    console.log('Received Z-API message for', instanceId);
    await this.webhooksService.processZapiMessage(instanceId, body);
    return res.status(HttpStatus.OK).send({ success: true });
  }
}
