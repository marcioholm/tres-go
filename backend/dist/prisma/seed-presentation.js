"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Criando usuário fictício para apresentação...');
    const email = 'apresentacao@northway.com';
    const password = 'senha';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Usuário Apresentação',
        }
    });
    let plan = await prisma.plan.findFirst({
        where: { slug: 'growth' }
    });
    if (!plan) {
        plan = await prisma.plan.findFirst();
        if (!plan) {
            throw new Error("Nenhum plano encontrado. Rode o seed principal primeiro.");
        }
    }
    const workspaceName = 'Empresa Fictícia S/A';
    let workspace = await prisma.workspace.findFirst({
        where: { name: workspaceName }
    });
    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: {
                name: workspaceName,
                plan: plan.name,
            }
        });
    }
    await prisma.workspaceUser.upsert({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId: workspace.id,
            }
        },
        update: {},
        create: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'ADMIN'
        }
    });
    const sector = await prisma.sector.upsert({
        where: {
            workspaceId_name: {
                workspaceId: workspace.id,
                name: 'Comercial'
            }
        },
        update: {},
        create: {
            workspaceId: workspace.id,
            name: 'Comercial',
            isDefault: true,
        }
    });
    await prisma.sectorMember.upsert({
        where: {
            sectorId_userId: {
                sectorId: sector.id,
                userId: user.id,
            }
        },
        update: {},
        create: {
            sectorId: sector.id,
            userId: user.id,
            role: 'SUPERVISOR',
        }
    });
    console.log('✅ Usuário fictício configurado com sucesso!');
    console.log('---');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    console.log(`Workspace: ${workspaceName}`);
    console.log('---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-presentation.js.map