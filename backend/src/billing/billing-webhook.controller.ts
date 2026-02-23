import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { AppGateway } from '../gateway/app.gateway';

@Controller('billing')
export class BillingWebhookController {
  private readonly logger = new Logger(BillingWebhookController.name);

  constructor(
    private billing: BillingService,
    private prisma: PrismaService,
    private asaas: AsaasService,
    private gateway: AppGateway,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleAsaasWebhook(
    @Body() payload: any,
    @Headers('asaas-access-token') token: string,
  ) {
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    const { event, payment } = payload;
    this.logger.log(`Asaas webhook: ${event} | Payment: ${payment?.id}`);

    switch (event) {
      // ── Pagamento confirmado ──────────────────────────────────────────────
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        const invoice = await this.prisma.invoice.findUnique({
          where: { asaasPaymentId: payment.id },
          include: { subscription: true },
        });
        if (!invoice) break;

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            paymentMethod: payment.billingType,
          },
        });

        if (
          invoice.subscription.status === 'BLOCKED' ||
          invoice.subscription.status === 'PAST_DUE'
        ) {
          await this.billing.unblockWorkspace(
            invoice.subscription.workspaceId,
            'payment_received',
          );
        }

        await this.prisma.subscription.update({
          where: { id: invoice.subscriptionId },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: new Date(payment.dueDate),
            currentPeriodEnd: this.addMonth(new Date(payment.dueDate)),
          },
        });
        break;
      }

      // ── Pagamento vencido ─────────────────────────────────────────────────
      case 'PAYMENT_OVERDUE': {
        const invoice = await this.prisma.invoice.findUnique({
          where: { asaasPaymentId: payment.id },
          include: { subscription: true },
        });
        if (!invoice) break;

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'OVERDUE' },
        });

        const daysOverdue = Math.floor(
          (Date.now() - new Date(payment.dueDate).getTime()) / 86400000,
        );

        if (daysOverdue >= 1 && invoice.subscription.status !== 'BLOCKED') {
          await this.prisma.subscription.update({
            where: { id: invoice.subscriptionId },
            data: { status: 'PAST_DUE' },
          });

          this.gateway.server
            .to(invoice.subscription.workspaceId)
            .emit('payment_overdue', {
              daysOverdue,
              dueDate: payment.dueDate,
              invoiceUrl: payment.invoiceUrl,
              message: `Fatura vencida há ${daysOverdue} dia(s). Regularize para evitar bloqueio.`,
            });
        }

        if (daysOverdue >= 5 && invoice.subscription.status !== 'BLOCKED') {
          await this.billing.blockWorkspace(
            invoice.subscription.workspaceId,
            `Fatura vencida há ${daysOverdue} dias. Regularize o pagamento para reativar.`,
            'system',
          );
        }
        break;
      }

      // ── Assinatura criada → registrar fatura ─────────────────────────────
      case 'PAYMENT_CREATED': {
        if (!payment.subscription) break;
        const sub = await this.prisma.subscription.findFirst({
          where: { asaasSubscriptionId: payment.subscription },
        });
        if (!sub) break;

        let pixQrCode, pixCopiaECola;
        if (payment.billingType === 'PIX') {
          try {
            const pix = await this.asaas.getPixQrCode(payment.id);
            pixQrCode = pix.encodedImage;
            pixCopiaECola = pix.payload;
          } catch (e) {
            this.logger.warn(
              `Failed to fetch PIX QR Code for payment ${payment.id}`,
            );
          }
        }

        await this.prisma.invoice.upsert({
          where: { asaasPaymentId: payment.id },
          create: {
            subscriptionId: sub.id,
            asaasPaymentId: payment.id,
            amount: payment.value,
            status: 'PENDING',
            dueDate: new Date(payment.dueDate),
            paymentMethod: payment.billingType,
            invoiceUrl: payment.invoiceUrl,
            pixQrCode,
            pixCopiaECola,
            description: payment.description,
          },
          update: {
            amount: payment.value,
            dueDate: new Date(payment.dueDate),
            invoiceUrl: payment.invoiceUrl,
            pixQrCode,
            pixCopiaECola,
          },
        });
        break;
      }

      // ── Assinatura cancelada ──────────────────────────────────────────────
      case 'SUBSCRIPTION_DELETED': {
        if (!payload.subscription?.id) break;
        const sub = await this.prisma.subscription.findFirst({
          where: { asaasSubscriptionId: payload.subscription.id },
        });
        if (sub) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });
        }
        break;
      }
    }

    return { received: true };
  }

  private addMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
  }
}
