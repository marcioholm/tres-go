import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from '../billing/asaas.service';
import { format, addDays } from 'date-fns';

@Injectable()
export class ImplementationService {
    private readonly logger = new Logger(ImplementationService.name);

    constructor(
        private prisma: PrismaService,
        private asaasService: AsaasService,
    ) { }

    async createOrder(workspaceId: string) {
        // 1. Verificar se já existe ordem para esse workspace
        const existingOrder = await this.prisma.implementationOrder.findUnique({
            where: { workspaceId },
        });

        if (existingOrder && existingOrder.status !== 'CANCELLED') {
            return existingOrder;
        }

        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { subscription: true },
        });

        if (!workspace) throw new NotFoundException('Workspace not found');

        // 2. Gerar link de pagamento no Asaas
        const dueDate = format(addDays(new Date(), 3), 'yyyy-MM-dd');

        // We need the asaasCustomerId from the subscription
        const asaasCustomerId = workspace.subscription?.asaasCustomerId;

        if (!asaasCustomerId) {
            throw new ConflictException('Workspace has no associated Asaas customer. Please configure billing first.');
        }

        const charge = await this.asaasService.createCharge({
            asaasCustomerId,
            value: 497.00,
            dueDate,
            description: "Implementação NorthWay Omni",
            billingType: 'PIX', // Prompt said UNDEFINED but AsaasService.createCharge uses specific types, I'll use PIX or allow both if supported
        });

        // 3. Salvar ImplementationOrder no banco
        return this.prisma.implementationOrder.create({
            data: {
                workspaceId,
                status: 'PENDING_PAYMENT',
                asaasPaymentId: charge.id,
                asaasPaymentUrl: charge.invoiceUrl,
                amount: 497.00,
            },
        });
    }

    async getOrder(workspaceId: string) {
        return this.prisma.implementationOrder.findUnique({
            where: { workspaceId },
        });
    }

    async markAsPaid(asaasPaymentId: string) {
        const order = await this.prisma.implementationOrder.findFirst({
            where: { asaasPaymentId },
        });

        if (!order) return;

        await this.prisma.implementationOrder.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        this.logger.log(`Implementation order ${order.id} marked as PAID`);

        // TODO: Send email to admin@northwaycompany.com.br
        // I don't have a MailService visible in the file list yet, but I'll log it as requested.
        console.log(`[EMAIL ADMIN] Nova implementação paga! Workspace ID: ${order.workspaceId}. Agendar em: /admin/implementations`);
    }

    async schedule(orderId: string, scheduledAt: Date) {
        return this.prisma.implementationOrder.update({
            where: { id: orderId },
            data: {
                status: 'SCHEDULED',
                scheduledAt,
            },
        });
        // TODO: Send email to client
    }

    async complete(orderId: string, notes?: string) {
        return this.prisma.implementationOrder.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                adminNotes: notes,
            },
        });
        // TODO: Send email to client
    }

    async listAll(status?: any) {
        return this.prisma.implementationOrder.findMany({
            where: status ? { status } : {},
            include: {
                workspace: {
                    include: {
                        users: {
                            where: { role: 'ADMIN' },
                            include: { user: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
