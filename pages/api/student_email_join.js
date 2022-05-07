import prisma from '../../prisma/prisma';

export default async function handle(req, res) {
  const data = JSON.parse(req.body);
  const userInfoReq = await fetch(
    `http://localhost:3001/get-student-profile?email=${data['email']}`
  );
  const userInfo = await userInfoReq.json();
  console.log(userInfo);
  if (userInfo.length != 0) {
    const createdStudentEmail = await prisma.classroom.update({
      where: {
        classroomId: data['classId'][0]
      },
      data: {
        fccUserIds: { push: userInfo[0]['uuid'] }
      }
    });
    return res.json(createdStudentEmail);
  } else {
    return res.json(400, {
      error: 1,
      msg: 'Not a freeCodeCamp email'
    });
  }
}
