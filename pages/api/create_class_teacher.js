import prisma from '../../prisma/prisma';

export default async function handle(req, res) {
  const data = JSON.parse(req.body);

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });

  res.json(createClassInDB);
}
