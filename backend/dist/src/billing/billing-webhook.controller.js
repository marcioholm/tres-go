"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BillingWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingWebhookController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const prisma_service_1 = require("../prisma/prisma.service");
const asaas_service_1 = require("./asaas.service");
const app_gateway_1 = require("../gateway/app.gateway");
let BillingWebhookController = BillingWebhookController_1 = class BillingWebhookController {
    constructor(billing, prisma, asaas, gateway) {
        this.billing = billing;
        this.prisma = prisma;
        this.asaas = asaas;
        this.gateway = gateway;
        this.logger = new common_1.Logger(BillingWebhookController_1.name);
    }
    async handleAsaasWebhook(payload, token) {
        if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
            throw new common_1.UnauthorizedException('Invalid webhook token');
        }
        const { event, payment } = payload;
        this.logger.log(`Asaas webhook: ${event} | Payment: ${payment?.id}`);
        switch (event) {
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_CONFIRMED': {
                const invoice = await this.prisma.invoice.findUnique({
                    where: { asaasPaymentId: payment.id },
                    include: { subscription: true },
                });
                if (!invoice)
                    break;
                await this.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'PAID', paidAt: new Date(), paymentMethod: payment.billingType },
                });
                if (invoice.subscription.status === 'BLOCKED' || invoice.subscription.status === 'PAST_DUE') {
                    await this.billing.unblockWorkspace(invoice.subscription.workspaceId, 'payment_received');
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
            case 'PAYMENT_OVERDUE': {
                const invoice = await this.prisma.invoice.findUnique({
                    where: { asaasPaymentId: payment.id },
                    include: { subscription: true },
                });
                if (!invoice)
                    break;
                await this.prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'OVERDUE' },
                });
                const daysOverdue = Math.floor((Date.now() - new Date(payment.dueDate).getTime()) / 86400000);
                if (daysOverdue >= 1 && invoice.subscription.status !== 'BLOCKED') {
                    await this.prisma.subscription.update({
                        where: { id: invoice.subscriptionId },
                        data: { status: 'PAST_DUE' },
                    });
                    this.gateway.server.to(invoice.subscription.workspaceId).emit('payment_overdue', {
                        daysOverdue,
                        dueDate: payment.dueDate,
                        invoiceUrl: payment.invoiceUrl,
                        message: `Fatura vencida há ${daysOverdue} dia(s). Regularize para evitar bloqueio.`,
                    });
                }
                if (daysOverdue >= 5 && invoice.subscription.status !== 'BLOCKED') {
                    await this.billing.blockWorkspace(invoice.subscription.workspaceId, `Fatura vencida há ${daysOverdue} dias. Regularize o pagamento para reativar.`, 'system');
                }
                break;
            }
            case 'PAYMENT_CREATED': {
                if (!payment.subscription)
                    break;
                const sub = await this.prisma.subscription.findFirst({
                    where: { asaasSubscriptionId: payment.subscription },
                });
                if (!sub)
                    break;
                let pixQrCode, pixCopiaECola;
                if (payment.billingType === 'PIX') {
                    try {
                        const pix = await this.asaas.getPixQrCode(payment.id);
                        pixQrCode = pix.encodedImage;
                        pixCopiaECola = pix.payload;
                    }
                    catch (e) {
                        this.logger.warn(`Failed to fetch PIX QR Code for payment ${payment.id}`);
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
                    }
                });
                break;
            }
            case 'SUBSCRIPTION_DELETED': {
                if (!payload.subscription?.id)
                    break;
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
    addMonth(date) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        return d;
    }
};
exports.BillingWebhookController = BillingWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('asaas-access-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingWebhookController.prototype, "handleAsaasWebhook", null);
exports.BillingWebhookController = BillingWebhookController = BillingWebhookController_1 = __decorate([
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        prisma_service_1.PrismaService,
        asaas_service_1.AsaasService,
        app_gateway_1.AppGateway])
], BillingWebhookController);
//# sourceMappingURL=billing-webhook.controller.js.map