
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const channels = await prisma.channel.findMany({
            where: { type: { in: ['MESSENGER', 'INSTAGRAM'] }, status: 'ACTIVE' }
        });
        console.log('Active Meta Channels:', JSON.stringify(channels, null, 2));
    } catch (e) {
        console.error('Error checking channels:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
