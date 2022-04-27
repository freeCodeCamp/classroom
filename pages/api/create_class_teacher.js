import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
  const data = JSON.parse(req.body);
  console.log(data);

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId']
    }
  });

  res.json(createClassInDB);
}
