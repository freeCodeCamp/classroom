import prisma from './prisma.ts';
import { createClassrooms } from './factories/classroom.ts';
import { createUsers } from './factories/user.ts';

const users = await createUsers();
await createClassrooms(users);
await prisma.$disconnect();
