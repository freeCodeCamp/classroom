import prisma from '../prisma.ts';
import type { Classroom, User } from '../../generated/prisma/client.ts';

export function upsertSeedClassroom(
  teacher: Pick<User, 'id'>,
  student: Pick<User, 'id'>
): Promise<Classroom> {
  return prisma.classroom.upsert({
    where: { classroomId: 'seed-classroom' },
    create: {
      classroomId: 'seed-classroom',
      classroomName: 'Seed classroom',
      description: 'Created by the seed script.',
      fccCertifications: ['responsive-web-design-v9'],
      fccUserIds: [student.id],
      classroomTeacherId: teacher.id
    },
    update: {
      classroomName: 'Seed classroom',
      description: 'Created by the seed script.',
      fccCertifications: ['responsive-web-design-v9'],
      fccUserIds: [student.id],
      classroomTeacherId: teacher.id
    }
  });
}
