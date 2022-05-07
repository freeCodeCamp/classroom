import prisma from '../../prisma/prisma';

export default async function handle(req, res) {
  const data = JSON.parse(req.body);
  const createdStudentEmail = await prisma.classroom.update({
    where: {
      classroomId: data['classId'][0]
    },
    data: {
      fccUserIds: { push: data['email'] }
    }
  });

  res.json(createdStudentEmail);
}
