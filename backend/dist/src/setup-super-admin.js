"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'admin@northway.com';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Super Admin',
        }
    });
    await prisma.superAdmin.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id
        }
    });
    console.log('✅ Super Admin configurado com sucesso!');
    console.log('---');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    console.log('---');
    console.log('Lembre-se de alterar a senha após o primeiro acesso.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=setup-super-admin.js.map