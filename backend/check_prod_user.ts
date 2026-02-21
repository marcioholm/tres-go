
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.lsscbhiojipxvybzpciy:j5LHjVtkOJcZTUOH@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
        }
    }
});

async function main() {
    console.log("Checking for user: marciol123.mgh@gmail.com");
    const user = await prisma.user.findUnique({
        where: { email: "marciol123.mgh@gmail.com" },
        include: { workspaces: true }
    });

    if (user) {
        console.log("User found:", JSON.stringify(user, null, 2));
    } else {
        console.log("User not found.");
    }

    const allUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log("Last 5 users:", JSON.stringify(allUsers, null, 2));
}

main()
    .catch(e => {
        console.error("Prisma error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
