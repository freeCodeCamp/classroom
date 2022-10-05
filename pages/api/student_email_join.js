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

  let user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email
    }
  });

  const data = JSON.parse(req.body);

  //make sure user is adding themselves to a classroom
  if (user.email !== data['email']) {
    res.status(403).end();
  }

  const existingStudent = await prisma.classroom.findUniqueOrThrow({
    where: {
      classroomId: data['classId'][0]
    }
  });
  const ids = existingStudent['fccUserIds'];
  if (ids.includes(user.id)) {
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
      fccUserIds: { push: user.id }
    }
  });
  return res.json(createdStudentEmail);
}
