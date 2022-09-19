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

  const data = JSON.parse(req.body);
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
  const checkClass = await prisma.classroom.findMany({
    where: {
      classroomId: data.join[0]
    },
    select: {
      fccUserIds: true
    }
  });
  if (checkClass[0].fccUserIds.includes(userInfo.id)) {
    res.status(409).end();
  } else {
    // Update user role to student
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        role: 'STUDENT'
      }
    });
    // Update calssroom with student id
    await prisma.classroom.update({
      where: {
        classroomId: data.join[0]
      },
      data: {
        fccUserIds: { push: userInfo.id }
      }
    });
    res.status(200).end();
  }
}
