import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding banners...');

    // Banners for NorthWay Assessoria
    const banners = [
        {
            title: "Atendimento organizado. Funil desenhado?",
            description: "De nada adianta o melhor atendimento se os leads não chegam. A NorthWay estrutura sua operação do tráfego até a venda.",
            ctaText: "QUERO ESTRUTURAR MEU FUNIL",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "EDUCATIONAL",
            position: "DASHBOARD_TOP",
            triggerCondition: "LOW_CONVERSATIONS",
            priority: 80,
        },
        {
            title: "Muito atendimento. Poucas vendas?",
            description: "O problema pode estar antes do atendimento. A gente entra na raiz — funil, processo comercial e follow-up.",
            ctaText: "ENTENDER O DIAGNÓSTICO",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "EDUCATIONAL",
            position: "DASHBOARD_TOP",
            triggerCondition: "LOW_CONVERSION",
            priority: 85,
        },
        {
            title: "A ferramenta é só o começo.",
            description: "O Omni organiza sua operação de atendimento. A NorthWay organiza tudo ao redor — tráfego, funil, CRM e comercial.",
            ctaText: "CONHECER A ASSESSORIA",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "EDUCATIONAL",
            position: "DASHBOARD_TOP",
            priority: 60,
            minTrialDays: 1,
            maxTrialDays: 10,
        },
        {
            title: "Canal conectado. E os clientes?",
            description: "Tráfego sem estrutura é dinheiro jogado fora. A NorthWay constrói o sistema de crescimento junto com você.",
            ctaText: "VER COMO FUNCIONA",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "EDUCATIONAL",
            position: "DASHBOARD_TOP",
            triggerCondition: "CHANNEL_NO_TRAFFIC",
            priority: 75,
        },
        {
            title: "Crescimento não é sorte. É construção.",
            description: "Empresas que estruturam funil, atendimento e processo comercial crescem com previsibilidade. A NorthWay faz isso.",
            ctaText: "QUERO CRESCER COM MÉTODO",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "SOCIAL_PROOF",
            position: "SIDEBAR",
            priority: 30,
        },
        {
            title: "Sua operação tem gargalos invisíveis?",
            description: "Em 30 minutos de diagnóstico gratuito a NorthWay identifica onde seu crescimento está travado — funil, atendimento ou comercial.",
            ctaText: "AGENDAR DIAGNÓSTICO GRATUITO",
            ctaUrl: "https://northwaycompany.com.br/diagnostico",
            type: "PROMO",
            position: "DASHBOARD_TOP",
            priority: 95,
        },
        // Some general onboarding/upsell banners
        {
            title: "Conecte seu WhatsApp",
            description: "Comece a escala de atendimentos agora mesmo conectando sua conta oficial ou Z-API.",
            ctaText: "CONECTAR AGORA",
            ctaUrl: "/settings/channels",
            type: "FEATURE",
            position: "DASHBOARD_TOP",
            triggerCondition: "NO_CHANNELS",
            priority: 100,
        },
        {
            title: "Novidade: Automação por IA",
            description: "Já imaginou sua IA respondendo 24/7? Ative agora mesmo na Base de Conhecimento.",
            ctaText: "EXPLORAR IA",
            ctaUrl: "/knowledge-base",
            type: "UPSELL",
            position: "SIDEBAR",
            targetPlan: "Starter",
            priority: 50,
        }
    ];

    for (const banner of banners) {
        await prisma.smartBanner.upsert({
            where: { id: banner.title }, // This is a bit hacky, but for seeding it works if we use title as ID or similar
            update: banner as any,
            create: banner as any,
        });
    }

    console.log('Banners seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
