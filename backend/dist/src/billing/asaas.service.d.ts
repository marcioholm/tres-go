export declare class AsaasService {
    private readonly logger;
    private readonly client;
    constructor();
    createCustomer(data: {
        name: string;
        email: string;
        cpfCnpj: string;
        phone?: string;
        postalCode?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
    }>;
    getCustomer(asaasCustomerId: string): Promise<any>;
    createSubscription(data: {
        asaasCustomerId: string;
        value: number;
        cycle: 'MONTHLY' | 'YEARLY';
        description: string;
        billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
        nextDueDate: string;
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
    }): Promise<any>;
    cancelSubscription(asaasSubscriptionId: string): Promise<void>;
    updateSubscription(asaasSubscriptionId: string, data: {
        value?: number;
        cycle?: 'MONTHLY' | 'YEARLY';
        nextDueDate?: string;
    }): Promise<any>;
    getPayment(asaasPaymentId: string): Promise<any>;
    getSubscriptionPayments(asaasSubscriptionId: string): Promise<any>;
    getPixQrCode(asaasPaymentId: string): Promise<{
        encodedImage: string;
        payload: string;
        expirationDate: string;
    }>;
    getBoletoUrl(asaasPaymentId: string): Promise<string>;
    createCharge(data: {
        asaasCustomerId: string;
        value: number;
        dueDate: string;
        description: string;
        billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
    }): Promise<any>;
    checkHealth(): Promise<{
        status: string;
        baseUrl: string;
        environment: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        baseUrl?: undefined;
        environment?: undefined;
    }>;
}
