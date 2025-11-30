// util/api_proccesor.js
import prisma from '../prisma/prisma';

/**
 * Fetch student data for a classroom from Prisma
 */
export async function fetchStudentData(classroomId) {
  const classroom = await prisma.classroom.findUnique({
    where: { classroomId },
    include: {
      students: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!classroom) return [];

  return classroom.students.map(s => ({
    id: s.id,
    name: s.name || 'Unnamed Student',
    email: s.email || 'No email'
  }));
}
