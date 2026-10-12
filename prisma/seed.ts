import prisma from './prisma.ts';
import { upsertSeedClassroom } from './factories/classroom.ts';
import { upsertSeedUsers } from './factories/user.ts';

try {
  const users = await upsertSeedUsers();
  const [, teacher, student] = users;
  if (!teacher || !student) throw new Error('Seed users missing');
  const classroom = await upsertSeedClassroom(teacher, student);
  console.log(
    `Seeded ${users.length} users and classroom ${classroom.classroomId}`
  );
} finally {
  await prisma.$disconnect();
}
