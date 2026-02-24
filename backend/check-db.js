
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function main() {
    try {
        console.log('Checking columns in Conversation table...');
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Conversation'
    `;
        console.log('Columns found:', JSON.stringify(columns, null, 2));

        const hasConvertedAt = columns.some(c => c.column_name === 'convertedAt');
        console.log(`\nHas 'convertedAt' column? ${hasConvertedAt}`);
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
