import { LegalService } from './legal.service';
export declare class LegalController {
    private readonly legalService;
    constructor(legalService: LegalService);
    acceptTerms(req: any, body: {
        termsVersion: string;
        privacyVersion: string;
    }): Promise<{
        id: string;
        userId: string;
        ip: string | null;
        termsVersion: string;
        privacyVersion: string;
        acceptedAt: Date;
        userAgent: string | null;
    }>;
    getAcceptance(req: any): Promise<{
        id: string;
        userId: string;
        ip: string | null;
        termsVersion: string;
        privacyVersion: string;
        acceptedAt: Date;
        userAgent: string | null;
    }>;
}
