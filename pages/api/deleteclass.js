import prisma from '../../prisma/prisma';

export default async function handle(req, res) {
  const data = JSON.parse(req.body);

  const deleteClass = await prisma.classroom.delete({
    where: {
      classroomId: data
    }
  });

  res.json(deleteClass);
}
