import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!req.method == 'PUT') {
    res.status(405).end();
  }

  if (!session) {
    res.status(403).end();
  }

  const body = req.body;
  // Grab user info here
  const userInfo = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true
    }
  });
  // Grab class info here
  const checkClass = await prisma.classroom.findUniqueOrThrow({
    where: {
      classroomId: body.join[0]
    },
    select: {
      fccUserIds: true
    }
  });
  const existsInClassroom = checkClass.fccUserIds.includes(userInfo.id);
  if (existsInClassroom) {
    res.status(409).end();
  }
  // TODO: Once we allow multiple teachers inside of a classroom, make sure that the teachers
  // are placed inside of the teacher array rather than as a regular student
  else if (userInfo.role === 'NONE') {
    // This runs only when a new user attempts to join a classroom.
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        role: 'STUDENT'
      }
    });
  }
  // Update calssroom with user id
  await prisma.classroom.update({
    where: {
      classroomId: body.join[0]
    },
    data: {
      fccUserIds: { push: userInfo.id }
    }
  });
  res.status(200).end();
}
