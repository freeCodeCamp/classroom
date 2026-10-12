import prisma from '../prisma.ts';
import type { Prisma, User } from '../../generated/prisma/client.ts';

export function createClassrooms(
  teachers: Pick<User, 'id' | 'name'>[]
): Promise<Prisma.BatchPayload> {
  const data = teachers.map(teacher => ({
    classroomName: `${teacher.name}'s classroom`,
    classroomTeacherId: teacher.id
  }));
  return prisma.classroom.createMany({
    data
  });
}
