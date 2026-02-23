import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@northway.com';
  const password = 'admin'; // Senha padrão recomendada para primeiro acesso
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
    },
  });

  await prisma.superAdmin.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
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
