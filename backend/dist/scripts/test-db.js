"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Testing database connection...');
    try {
        const userCount = await prisma.user.count();
        console.log('Connection successful. User count:', userCount);
        console.log('Checking User model fields...');
        const userColumns = await prisma.$queryRaw `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `;
        console.log('User columns:', userColumns);
        console.log('Checking Plan count...');
        const planCount = await prisma.plan.count();
        console.log('Plan count:', planCount);
    }
    catch (error) {
        console.error('Database test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-db.js.map