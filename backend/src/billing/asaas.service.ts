import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

// Documentação: https://docs.asaas.com

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.ASAAS_BASE_URL, // https://sandbox.asaas.com/api/v3 ou https://api.asaas.com/api/v3
      headers: {
        access_token: process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── Clientes ────────────────────────────────────────────────────────────────

  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    postalCode?: string;
  }): Promise<{ id: string; name: string; email: string }> {
    const res = await this.client.post('/customers', {
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, ''), // só números
      phone: data.phone,
      postalCode: data.postalCode,
      notificationDisabled: false, // Asaas envia e-mails de cobrança automaticamente
    });
    return res.data;
  }

  async getCustomer(asaasCustomerId: string) {
    const res = await this.client.get(`/customers/${asaasCustomerId}`);
    return res.data;
  }

  // ── Assinaturas ─────────────────────────────────────────────────────────────

  async createSubscription(data: {
    asaasCustomerId: string;
    value: number;
    cycle: 'MONTHLY' | 'YEARLY';
    description: string;
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
    nextDueDate: string; // YYYY-MM-DD
    creditCard?: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo?: {
      name: string;
      email: string;
      cpfCnpj: string;
      phone: string;
    };
  }) {
    const payload: any = {
      customer: data.asaasCustomerId,
      billingType: data.billingType,
      value: data.value,
      nextDueDate: data.nextDueDate,
      cycle: data.cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
      description: data.description,
    };

    if (data.billingType === 'CREDIT_CARD' && data.creditCard) {
      payload.creditCard = data.creditCard;
      payload.creditCardHolderInfo = data.creditCardHolderInfo;
    }

    const res = await this.client.post('/subscriptions', payload);
    return res.data;
  }

  async cancelSubscription(asaasSubscriptionId: string) {
    await this.client.delete(`/subscriptions/${asaasSubscriptionId}`);
  }

  async updateSubscription(
    asaasSubscriptionId: string,
    data: {
      value?: number;
      cycle?: 'MONTHLY' | 'YEARLY';
      nextDueDate?: string;
    },
  ) {
    const res = await this.client.post(
      `/subscriptions/${asaasSubscriptionId}`,
      data,
    );
    return res.data;
  }

  // ── Pagamentos / Faturas ─────────────────────────────────────────────────────

  async getPayment(asaasPaymentId: string) {
    const res = await this.client.get(`/payments/${asaasPaymentId}`);
    return res.data;
  }

  async getSubscriptionPayments(asaasSubscriptionId: string) {
    const res = await this.client.get(
      `/payments?subscription=${asaasSubscriptionId}`,
    );
    return res.data.data;
  }

  async getPixQrCode(asaasPaymentId: string): Promise<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  }> {
    const res = await this.client.get(`/payments/${asaasPaymentId}/pixQrCode`);
    return res.data;
  }

  async getBoletoUrl(asaasPaymentId: string): Promise<string> {
    const res = await this.client.get(
      `/payments/${asaasPaymentId}/identificationField`,
    );
    return res.data.identificationField;
  }

  // ── Criar cobrança avulsa (para upgrade imediato, pro-rata, etc.) ──────────

  async createCharge(data: {
    asaasCustomerId: string;
    value: number;
    dueDate: string;
    description: string;
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  }) {
    const res = await this.client.post('/payments', {
      customer: data.asaasCustomerId,
      billingType: data.billingType,
      value: data.value,
      dueDate: data.dueDate,
      description: data.description,
    });
    return res.data;
  }

  async checkHealth() {
    try {
      // Documentação sugere pingar /customers ou similar para validar a key
      const res = await this.client.get('/customers?limit=1');
      return {
        status: 'connected',
        baseUrl: process.env.ASAAS_BASE_URL,
        environment: process.env.ASAAS_BASE_URL?.includes('sandbox')
          ? 'sandbox'
          : 'production',
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
      };
    }
  }
}
