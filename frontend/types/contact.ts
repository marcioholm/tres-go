export enum TrafficSource {
    GOOGLE_ADS = "GOOGLE_ADS",
    GOOGLE_ORGANIC = "GOOGLE_ORGANIC",
    META_ADS = "META_ADS",
    META_ORGANIC = "META_ORGANIC",
    WHATSAPP_DIRECT = "WHATSAPP_DIRECT",
    INSTAGRAM_DIRECT = "INSTAGRAM_DIRECT",
    TIKTOK_ADS = "TIKTOK_ADS",
    TIKTOK_ORGANIC = "TIKTOK_ORGANIC",
    YOUTUBE = "YOUTUBE",
    EMAIL_MARKETING = "EMAIL_MARKETING",
    INDICATION = "INDICATION",
    COLD_CALL = "COLD_CALL",
    EVENT = "EVENT",
    OTHER = "OTHER"
}

export interface SaleItem {
    id: string
    name: string
    quantity: number
    unitPrice: number
    total: number
}

export interface Sale {
    id: string
    title: string
    amount: number
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'REFUNDED'
    createdAt: string
    items: SaleItem[]
}

export interface Contact {
    id: string
    name: string
    phone?: string
    email?: string
    source?: TrafficSource
    sourceMedium?: string
    sourceCampaign?: string
    tags?: Tag[]
    sales?: Sale[]
    // Add other fields as needed
}

export interface Tag {
    id: string
    name: string
    color?: string
}
