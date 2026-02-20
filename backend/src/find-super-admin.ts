import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const superAdmins = await prisma.superAdmin.findMany({
        include: { user: true }
    });

    if (superAdmins.length === 0) {
        console.log('Nenhum Super Admin encontrado no banco de dados.');
        // List all users to see if there's any obvious admin
        const users = await prisma.user.findMany();
        console.log('Usuários existentes:', JSON.stringify(users, null, 2));
    } else {
        console.log('Super Admins encontrados:', JSON.stringify(superAdmins, null, 2));
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
