"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Connecting to DB...");
    await prisma.$connect();
    const users = await prisma.user.findMany({
        include: { workspaces: true }
    });
    console.log(`Found ${users.length} users.`);
    for (const user of users) {
        console.log(`User: ${user.email} (ID: ${user.id})`);
        console.log(`Workspaces: ${JSON.stringify(user.workspaces)}`);
        if (user.workspaces.length === 0) {
            console.log("User has NO workspaces. Attempting self-healing simulation...");
            try {
                const workspace = await prisma.workspace.create({
                    data: {
                        name: 'Meu Workspace (Debug)',
                        plan: 'FREE',
                        users: {
                            create: {
                                userId: user.id,
                                role: 'ADMIN'
                            }
                        },
                        kanbanBoards: {
                            create: {
                                name: 'Funil de Vendas',
                                columns: {
                                    create: [
                                        { name: 'Novo Lead', order: 0, color: '#fbbf24' },
                                        { name: 'Em Contato', order: 1, color: '#3b82f6' },
                                        { name: 'Agendado', order: 2, color: '#8b5cf6' },
                                        { name: 'Proposta', order: 3, color: '#ec4899' },
                                        { name: 'Negociação', order: 4, color: '#f97316' },
                                        { name: 'Ganho', order: 5, color: '#22c55e', isWon: true },
                                        { name: 'Perdido', order: 6, color: '#ef4444', isLost: true },
                                    ]
                                }
                            }
                        }
                    }
                });
                console.log("Created workspace:", workspace.id);
                const updatedUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { workspaces: true }
                });
                console.log("Updated Workspaces:", JSON.stringify(updatedUser?.workspaces));
            }
            catch (e) {
                console.error("Failed to creat workspace:", e);
            }
        }
    }
    const allWorkspaces = await prisma.workspace.findMany();
    console.log(`Total Workspaces in DB: ${allWorkspaces.length}`);
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=debug_auth_logic.js.map