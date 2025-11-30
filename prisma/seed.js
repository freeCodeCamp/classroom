import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        name: 'Hamzat Victor',
        email: 'oluwaborihamzat@gmail.com',
        role: 'ADMIN'
      },
      {
        name: 'Alade Christopher',
        email: 'aladechristoph@gmail.com',
        role: 'TEACHER'
      },
      {
        name: 'Ayomide Onifade',
        email: 'Jangulabi@gmail.com',
        role: 'NONE'
      }
    ],
    skipDuplicates: true // avoids error if they already exist
  });
  console.log('✅ Seeded users successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
