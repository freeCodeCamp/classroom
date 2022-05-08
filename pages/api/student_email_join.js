import prisma from '../../prisma/prisma';

export default async function handle(req, res) {
  const data = JSON.parse(req.body);
  const userInfoReq = await fetch(
    `http://localhost:3001/get-student-profile?email=${data['email']}`
  );
  const userInfo = await userInfoReq.json();
  if (userInfo.length != 0) {
    const existingStudent = await prisma.classroom.findMany({
      where: {
        classroomId: data['classId'][0]
      }
    });
    const ids = existingStudent[0]['fccUserIds'];
    if (ids.includes(userInfo[0]['uuid'])) {
      return res.json(409, {
        error: 1,
        msg: 'Account already exists'
      });
    }
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
