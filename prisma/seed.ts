import prisma from './prisma.ts';
import { upsertSeedClassroom } from './factories/classroom.ts';
import { upsertSeedUsers } from './factories/user.ts';
import { findSeedProblem } from '../util/seedGuard.ts';

const seedProblem = findSeedProblem(process.env);
if (seedProblem) {
  console.error(seedProblem);
  process.exit(1);
}

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
