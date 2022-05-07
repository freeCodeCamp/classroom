import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handle(req, res) {
  const data = JSON.parse(req.body);
  console.log(data);
  //check if the student email exists in the freecodecamp database with their api?

  //add student email to the database
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
