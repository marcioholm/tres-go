"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'marciogholmm@gmail.com';
    console.log(`Checking for user with email: ${email}`);
    const user = await prisma.user.findUnique({
        where: { email },
        include: { workspaces: true }
    });
    if (user) {
        console.log('User found:', user);
        if (user.workspaces && user.workspaces.length > 0) {
            console.log('Deleting workspace associations...');
            await prisma.workspaceUser.deleteMany({
                where: { userId: user.id }
            });
        }
        console.log('Deleting user...');
        await prisma.user.delete({
            where: { id: user.id }
        });
        console.log('User deleted successfully.');
    }
    else {
        console.log('User not found.');
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
//# sourceMappingURL=cleanup_user.js.map