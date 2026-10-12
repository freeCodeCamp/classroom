import prisma from '../prisma.ts';
import type { User } from '../../generated/prisma/client.ts';

export function createUsers(): Promise<User[]> {
  const usersData = [
    {
      name: 'foo',
      email: 'foo@bar.com',
      emailVerified: new Date(),
      role: 'STUDENT'
    },
    {
      name: 'boo',
      email: 'boo@far.com',
      emailVerified: new Date(),
      role: 'TEACHER'
    }
  ];
  const usersPromise = usersData.map(
    async data => await prisma.user.create({ data })
  );
  return Promise.all(usersPromise);
}
