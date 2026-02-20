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
var AsaasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaasService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let AsaasService = AsaasService_1 = class AsaasService {
    constructor() {
        this.logger = new common_1.Logger(AsaasService_1.name);
        this.client = axios_1.default.create({
            baseURL: process.env.ASAAS_BASE_URL,
            headers: {
                'access_token': process.env.ASAAS_API_KEY,
                'Content-Type': 'application/json',
            },
        });
    }
    async createCustomer(data) {
        const res = await this.client.post('/customers', {
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
            phone: data.phone,
            postalCode: data.postalCode,
            notificationDisabled: false,
        });
        return res.data;
    }
    async getCustomer(asaasCustomerId) {
        const res = await this.client.get(`/customers/${asaasCustomerId}`);
        return res.data;
    }
    async createSubscription(data) {
        const payload = {
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
    async cancelSubscription(asaasSubscriptionId) {
        await this.client.delete(`/subscriptions/${asaasSubscriptionId}`);
    }
    async updateSubscription(asaasSubscriptionId, data) {
        const res = await this.client.post(`/subscriptions/${asaasSubscriptionId}`, data);
        return res.data;
    }
    async getPayment(asaasPaymentId) {
        const res = await this.client.get(`/payments/${asaasPaymentId}`);
        return res.data;
    }
    async getSubscriptionPayments(asaasSubscriptionId) {
        const res = await this.client.get(`/payments?subscription=${asaasSubscriptionId}`);
        return res.data.data;
    }
    async getPixQrCode(asaasPaymentId) {
        const res = await this.client.get(`/payments/${asaasPaymentId}/pixQrCode`);
        return res.data;
    }
    async getBoletoUrl(asaasPaymentId) {
        const res = await this.client.get(`/payments/${asaasPaymentId}/identificationField`);
        return res.data.identificationField;
    }
    async createCharge(data) {
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
            const res = await this.client.get('/customers?limit=1');
            return {
                status: 'connected',
                baseUrl: process.env.ASAAS_BASE_URL,
                environment: process.env.ASAAS_BASE_URL?.includes('sandbox') ? 'sandbox' : 'production'
            };
        }
        catch (error) {
            return {
                status: 'disconnected',
                error: error.message
            };
        }
    }
};
exports.AsaasService = AsaasService;
exports.AsaasService = AsaasService = AsaasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AsaasService);
//# sourceMappingURL=asaas.service.js.map