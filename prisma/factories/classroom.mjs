import prisma from '../prisma.js';

export function createClassrooms(teachers) {
  const data = teachers.map(teacher => ({
    classroomName: `${teacher.name}'s classroom`,
    classroomTeacherId: teacher.id
  }));
  return prisma.classroom.createMany({
    data
  });
}
