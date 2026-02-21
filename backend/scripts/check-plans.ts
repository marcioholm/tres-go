import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Planes en DB ---');
    const plans = await prisma.plan.findMany();
    console.log(JSON.stringify(plans, null, 2));

    if (plans.length === 0) {
        console.log('No plans found. Seeding default plans...');
        await prisma.plan.createMany({
            data: [
                {
                    name: 'Starter',
                    slug: 'starter',
                    priceMonthly: 97,
                    priceYearly: 890,
                    trialDays: 7,
                    maxAgents: 3,
                    maxChannels: 2,
                    maxConversationsPerMonth: 1000,
                    maxSectors: 3,
                    maxCampaigns: 5,
                    hasKanban: true,
                    hasReports: true,
                    hasChatbot: true
                },
                {
                    name: 'Growth',
                    slug: 'growth',
                    priceMonthly: 197,
                    priceYearly: 1890,
                    trialDays: 7,
                    maxAgents: 10,
                    maxChannels: 5,
                    maxConversationsPerMonth: 5000,
                    maxSectors: 10,
                    maxCampaigns: 20,
                    hasKanban: true,
                    hasReports: true,
                    hasChatbot: true,
                    hasAI: true,
                    hasAPI: true,
                    hasMultiSectors: true
                }
            ]
        });
        console.log('Plans seeded successfully.');
    } else {
        const hasStarter = plans.some(p => p.slug === 'starter');
        if (!hasStarter) {
            console.log('Starter plan missing. Adding it...');
            await prisma.plan.create({
                data: {
                    name: 'Starter',
                    slug: 'starter',
                    priceMonthly: 97,
                    priceYearly: 890,
                    trialDays: 7,
                    maxAgents: 3,
                    maxChannels: 2,
                    maxConversationsPerMonth: 1000,
                    maxSectors: 3,
                    maxCampaigns: 5,
                    hasKanban: true,
                    hasReports: true,
                    hasChatbot: true
                }
            });
            console.log('Starter plan added.');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
