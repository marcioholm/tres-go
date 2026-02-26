import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultColumns = [
    { name: '🔵 Novo Lead', color: '#3b82f6', order: 0, isWon: false, isLost: false },
    { name: '🟡 Contato Realizado', color: '#eab308', order: 1, isWon: false, isLost: false },
    { name: '🟠 Proposta Enviada', color: '#f97316', order: 2, isWon: false, isLost: false },
    { name: '🔴 Negociação', color: '#ef4444', order: 3, isWon: false, isLost: false },
    { name: '🟢 Ganho', color: '#10b981', order: 4, isWon: true, isLost: false },
    { name: '⚫ Perdido', color: '#6b7280', order: 5, isWon: false, isLost: true },
];

const plansSeed = [
    {
        name: 'Starter',
        slug: 'starter',
        description: 'Ideal para pequenos negócios',
        priceMonthly: 97,
        priceYearly: 970,
        trialDays: 14,
        maxAgents: 2,
        maxChannels: 1,
        maxConversationsPerMonth: 500,
        maxCampaigns: 0,
        maxStorage: 512,
        maxSectors: 1,
        hasKanban: false,
        hasChatbot: false,
        hasAI: false,
        hasReports: true,
        hasAPI: false,
        hasWhiteLabel: false,
        hasMultiSectors: false,
        hasCampaigns: false,
        hasSalesHistory: true,
        hasScheduledMessages: false,
    },
    {
        name: 'Growth',
        slug: 'growth',
        description: 'Para equipes em crescimento',
        priceMonthly: 297,
        priceYearly: 2970,
        trialDays: 14,
        maxAgents: 10,
        maxChannels: 3,
        maxConversationsPerMonth: 3000,
        maxCampaigns: 10,
        maxStorage: 5120,
        maxSectors: 3,
        hasKanban: true,
        hasChatbot: false,
        hasAI: false,
        hasReports: true,
        hasAPI: false,
        hasWhiteLabel: false,
        hasMultiSectors: true,
        hasCampaigns: true,
        hasSalesHistory: true,
        hasScheduledMessages: true,
    },
    {
        name: 'Pro',
        slug: 'pro',
        description: 'Recursos completos para escalar',
        priceMonthly: 597,
        priceYearly: 5970,
        trialDays: 14,
        maxAgents: 9999,
        maxChannels: 9999,
        maxConversationsPerMonth: 9999,
        maxCampaigns: 9999,
        maxStorage: 51200,
        maxSectors: 9999,
        hasKanban: true,
        hasChatbot: true,
        hasAI: true,
        hasReports: true,
        hasAPI: true,
        hasWhiteLabel: false,
        hasMultiSectors: true,
        hasCampaigns: true,
        hasSalesHistory: true,
        hasScheduledMessages: true,
    },
    {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'White-label e personalização total',
        priceMonthly: 0,    // preço customizado pelo Super Admin
        priceYearly: 0,
        trialDays: 30,
        maxAgents: 9999,
        maxChannels: 9999,
        maxConversationsPerMonth: 9999,
        maxCampaigns: 9999,
        maxStorage: 999999,
        maxSectors: 9999,
        isPublic: false,    // só Super Admin atribui
        hasKanban: true,
        hasChatbot: true,
        hasAI: true,
        hasReports: true,
        hasAPI: true,
        hasWhiteLabel: true,
        hasMultiSectors: true,
        hasCampaigns: true,
        hasSalesHistory: true,
        hasScheduledMessages: true,
    },
];

const bannersSeed = [
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

async function main() {
    console.log('🌱 Start seeding...');

    // Seeding planos
    console.log('Seeding plans...');
    for (const plan of plansSeed) {
        await prisma.plan.upsert({
            where: { slug: plan.slug },
            update: plan,
            create: plan,
        });
    }
    console.log('✅ Plans seeded successfully.');

    // Get all existing workspaces
    const workspaces = await prisma.workspace.findMany();

    console.log(`Found ${workspaces.length} workspaces.`);

    for (const workspace of workspaces) {
        // Check if workspace already has a Kanban Board
        const existingBoard = await prisma.kanbanBoard.findFirst({
            where: { workspaceId: workspace.id },
        });

        if (!existingBoard) {
            console.log(`Creating Kanban Board for workspace: ${workspace.name} (${workspace.id})`);

            const board = await prisma.kanbanBoard.create({
                data: {
                    workspaceId: workspace.id,
                    name: 'Funil de Vendas',
                    columns: {
                        create: defaultColumns.map(col => ({
                            name: col.name,
                            color: col.color,
                            order: col.order,
                            isWon: col.isWon,
                            isLost: col.isLost,
                        }))
                    }
                }
            });

            console.log(`✅ Created board: ${board.id}`);
        } else {
            console.log(`Skipping workspace ${workspace.name}, board already exists.`);
        }
    }

    // Seeding banners
    console.log('Seeding banners...');
    for (const banner of bannersSeed) {
        // We use title as a simple way to find existing banners in seed
        const existing = await prisma.smartBanner.findFirst({
            where: { title: banner.title }
        });

        if (!existing) {
            await prisma.smartBanner.create({
                data: banner as any
            });
        } else {
            await prisma.smartBanner.update({
                where: { id: existing.id },
                data: banner as any
            });
        }
    }
    console.log('✅ Banners seeded successfully.');

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
