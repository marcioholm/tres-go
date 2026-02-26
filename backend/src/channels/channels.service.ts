import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { Channel } from '@prisma/client';
import { encrypt } from '../utils/crypto.util';
import { RedisService } from '../common/redis.service';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private billing: BillingService,
    private redis: RedisService,
  ) { }

  async create(workspaceId: string, data: any) {
    // Check billing limits
    const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
    if (!limitInfo.allowed) {
      throw new BadRequestException(
        `Limite de canais (${limitInfo.limit}) atingido para o seu plano.`,
      );
    }

    return this.prisma.channel.create({
      data: {
        workspaceId,
        name: data.name,
        type: (data.type || 'WHATSAPP') as any,
        status: (data.status || 'ACTIVE') as any,
        // Meta fields
        pageId: data.pageId,
        pageName: data.pageName,
        pageAvatar: data.pageAvatar,
        accessToken: data.accessToken ? encrypt(data.accessToken) : undefined,
        igAccountId: data.igAccountId,
        igUsername: data.igUsername,
        // WhatsApp fields
        phoneNumber: data.phoneNumber,
        phoneNumberId: data.phoneNumberId,
        wabaId: data.wabaId,
        displayName: data.displayName,
        webhookSecret: data.webhookSecret,
        // Flexible config (Z-API, etc.)
        config: data.config ?? {},
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.channel.findMany({
      where: { workspaceId },
    });
  }

  async remove(id: string, workspaceId: string) {
    // 1. Delete dependent data that might block channel deletion
    await this.prisma.scheduledMessage.deleteMany({ where: { channelId: id } });

    // 2. Clear messages for all conversations of this channel
    const conversations = await this.prisma.conversation.findMany({
      where: { channelId: id },
      select: { id: true }
    });
    const conversationIds = conversations.map(c => c.id);

    await this.prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await this.prisma.archivedMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await this.prisma.conversationTransfer.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await this.prisma.conversationSession.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await this.prisma.conversationConversion.deleteMany({ where: { conversationId: { in: conversationIds } } });

    // 3. Delete conversations
    await this.prisma.conversation.deleteMany({ where: { channelId: id } });

    // 4. Finally delete the channel
    return this.prisma.channel.delete({
      where: { id, workspaceId },
    });
  }

  async update(
    id: string,
    body: { name?: string; displayName?: string; config?: any },
    workspaceId: string,
  ) {
    const data: any = { ...body };

    return this.prisma.channel.update({
      where: { id, workspaceId },
      data,
    });
  }

  // WhatsApp: solicitar código de verificação
  async requestWhatsAppCode(
    body: { phoneNumber: string; method: 'SMS' | 'VOICE'; channelName: string },
    workspaceId: string,
  ): Promise<{ channelId: string }> {
    const { phoneNumber, method, channelName } = body;

    // Limite de canais
    const limitInfo = await this.billing.checkLimit(workspaceId, 'channels');
    if (!limitInfo.allowed) {
      throw new BadRequestException(
        `Limite de canais (${limitInfo.limit}) atingido.`,
      );
    }

    // Criar canal em estado CONNECTING
    const channel = await this.prisma.channel.create({
      data: {
        workspaceId,
        type: 'WHATSAPP',
        name: channelName,
        status: 'CONNECTING',
        phoneNumber,
      },
    });

    // Solicitar código via Meta API
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/request_code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code_method: method,
            language: 'pt_BR',
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        console.error('WhatsApp request code error:', error);
        await this.prisma.channel.delete({ where: { id: channel.id } });
        throw new BadRequestException(
          'Falha ao solicitar código de verificação',
        );
      }

      return { channelId: channel.id };
    } catch (err) {
      await this.prisma.channel.delete({ where: { id: channel.id } });
      throw new BadRequestException('Erro de comunicação com a Meta');
    }
  }

  // WhatsApp: verificar código
  async verifyWhatsAppCode(
    body: { channelId: string; code: string },
    workspaceId: string,
  ): Promise<Channel> {
    const channel = await this.prisma.channel.findFirst({
      where: { id: body.channelId, workspaceId },
    });

    if (!channel) throw new NotFoundException('Canal não encontrado');

    // Verificar código com a Meta
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/verify_code`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.META_SYSTEM_USER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: body.code }),
      },
    );

    if (!res.ok) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Ativar canal
    return this.prisma.channel.update({
      where: { id: channel.id },
      data: { status: 'ACTIVE' },
    });
  }

  async storePageSession(pages: any[]): Promise<string> {
    const key = Math.random().toString(36).substring(7);
    await this.redis.set(`page-session:${key}`, JSON.stringify(pages), 600);
    return key;
  }
  async getPageSession(key: string) {
    const data = await this.redis.get(`page-session:${key}`);
    return data ? JSON.parse(data) : null;
  }
}
