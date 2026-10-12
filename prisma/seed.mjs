import prisma from './prisma.js';
import { createClassrooms } from './factories/classroom.mjs';
import { createUsers } from './factories/user.mjs';

const users = await createUsers();
await createClassrooms(users);
await prisma.$disconnect();
