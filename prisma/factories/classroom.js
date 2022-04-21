const { PrismaClient } = require('@prisma/client');

// TODO: replace this with the global prisma client
const prisma = new PrismaClient();

exports.createClassrooms = function createClassrooms(teachers) {
  const data = teachers.map(teacher => ({
    classroomName: `${teacher.name}'s classroom`,
    classroomTeacherId: teacher.id
  }));
  return prisma.classroom.createMany({
    data
  });
};
