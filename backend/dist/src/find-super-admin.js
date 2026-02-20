"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const superAdmins = await prisma.superAdmin.findMany({
        include: { user: true }
    });
    if (superAdmins.length === 0) {
        console.log('Nenhum Super Admin encontrado no banco de dados.');
        const users = await prisma.user.findMany();
        console.log('Usuários existentes:', JSON.stringify(users, null, 2));
    }
    else {
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
//# sourceMappingURL=find-super-admin.js.map