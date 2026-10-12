import prisma from '../prisma.ts';
import type { User } from '../../generated/prisma/client.ts';

export const SEED_USERS = [
  { email: 'admin@classroom.local', name: 'Admin', role: 'ADMIN' },
  { email: 'teacher@classroom.local', name: 'Teacher', role: 'TEACHER' },
  { email: 'student@classroom.local', name: 'Student', role: 'STUDENT' }
];

export async function upsertSeedUsers(): Promise<User[]> {
  const users: User[] = [];
  for (const { email, name, role } of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name, role, emailVerified: new Date() },
      update: { name, role }
    });
    users.push(user);
  }
  return users;
}
