const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'asc' }, // Primeiro usuário costuma ser o admin
            include: { superAdmin: true }
        });

        if (!user) {
            console.log('Nenhum usuário encontrado.');
            return;
        }

        console.log(`Usuário encontrado: ${user.email}`);
        console.log(`É Super Admin? ${!!user.superAdmin}`);

        if (!user.superAdmin) {
            console.log('Criando registro de Super Admin...');
            await prisma.superAdmin.create({
                data: { userId: user.id }
            });
            console.log('Usuário agora é Super Admin.');
        } else {
            console.log('Usuário já é Super Admin.');
        }
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
