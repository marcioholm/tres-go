import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding NorthWay Banners...');

    const banners = [
        {
            title: 'Atrair: Capte Leads Qualificados',
            description: 'Transforme visitantes em oportunidades reais com estratégias de tráfego e funis de atração NorthWay.',
            ctaText: 'Agendar Mentoria',
            ctaUrl: 'https://wa.me/5511999999999?text=Quero+atrair+mais+leads',
            type: 'PROMO',
            position: 'DASHBOARD_TOP',
            priority: 10,
            isActive: true,
        },
        {
            title: 'Engajar: Automação Inteligente',
            description: 'Não deixe nenhum lead esfriar. Use nossas automações para manter conversas ativas e relevantes.',
            ctaText: 'Ver Automações',
            ctaUrl: 'https://wa.me/5511999999999?text=Quero+engajar+meus+leads',
            type: 'PROMO',
            position: 'DASHBOARD_TOP',
            priority: 9,
            isActive: true,
        },
        {
            title: 'Reter: Fidelização e LTV',
            description: 'Custa 7x menos manter um cliente do que atrair um novo. Descubra como reter sua base com a Assessoria.',
            ctaText: 'Falar com Consultor',
            ctaUrl: 'https://wa.me/5511999999999?text=Quero+reter+meus+clientes',
            type: 'PROMO',
            position: 'DASHBOARD_TOP',
            priority: 8,
            isActive: true,
        },
        {
            title: 'Vender: Maximize suas Conversões',
            description: 'Otimize cada etapa do seu funil para converter mais vendas com menor esforço e maior lucro.',
            ctaText: 'Começar Agora',
            ctaUrl: 'https://wa.me/5511999999999?text=Quero+vender+mais',
            type: 'PROMO',
            position: 'DASHBOARD_TOP',
            priority: 7,
            isActive: true,
        }
    ];

    for (const bannerData of banners) {
        await prisma.smartBanner.create({
            data: bannerData as any
        });
    }

    console.log('✅ Banners seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
