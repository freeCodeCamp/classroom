import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!req.method == 'POST') {
    res.status(405).end();
  }

  if (!session) {
    res.status(403).end();
  }

  const data = JSON.parse(req.body);

  //make sure user is adding themselves to a classroom
  if (session.user.email !== data['email']) {
    res.status(403).end();
  }

  const userInfoReq = await fetch(
    `http://localhost:3002/getstudentprofile?email=${data['email']}`
  );
  const userInfo = await userInfoReq.json();
  if (userInfo.length !== 0) {
    const existingStudent = await prisma.classroom.findMany({
      where: {
        classroomId: data['classId'][0]
      }
    });
    const ids = existingStudent[0]['fccUserIds'];
    if (ids.includes(userInfo[0]['uuid'])) {
      return res.status(409).json({
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
    return res.status(400).json({
      error: 1,
      msg: 'Not a freeCodeCamp email'
    });
  }
}
