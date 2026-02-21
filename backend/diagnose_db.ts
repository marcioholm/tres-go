import { PrismaClient } from '@prisma/client';

async function diagnose() {
    const prisma = new PrismaClient();
    try {
        console.log('Checking database connection...');
        await prisma.$connect();

        console.log('Diagnosing Channel table...');
        const columns: any[] = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Channel';
        `;

        console.log('Current columns in Channel:');
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

        const hasConfig = columns.some(c => c.column_name === 'config');
        if (!hasConfig) {
            console.log('CRITICAL: Column "config" is MISSING.');
            console.log('Attempting to fix...');
            await prisma.$executeRawUnsafe(`ALTER TABLE "Channel" ADD COLUMN "config" JSONB;`);
            console.log('Column "config" added successfully.');
        } else {
            console.log('Column "config" exists.');
        }

    } catch (e) {
        console.error('Diagnosis failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
