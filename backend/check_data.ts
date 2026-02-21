import { PrismaClient } from '@prisma/client';

async function check() {
    const prisma = new PrismaClient();
    const workspaceId = 'cmlwejv8q000177q7hfuwe66j';
    try {
        await prisma.$connect();

        console.log(`Checking channels for workspace: ${workspaceId}`);
        const channels = await prisma.channel.findMany({
            where: { workspaceId }
        });

        console.log(`Found ${channels.length} channels:`);
        channels.forEach(ch => {
            console.log(`- ID: ${ch.id}, Type: ${ch.type}, Name: ${ch.name}, Status: ${ch.status}, PageID: ${ch.pageId}, IGID: ${ch.igAccountId}`);
        });

        console.log('\nChecking MetaIntegrations:');
        // @ts-ignore
        const meta = await prisma.metaIntegration.findMany();
        console.log(`Found ${meta.length} global meta integrations:`);
        meta.forEach(m => {
            console.log(`- Page: ${m.pageName}, PageID: ${m.pageId}, IGID: ${m.igBusinessAccountId}`);
        });

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
