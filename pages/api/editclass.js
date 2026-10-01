import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  const data = req.body;
  let user, classroom;

  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  if (!session) {
    return res.status(403).end();
  }

  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: session.user.email
      },
      select: {
        role: true,
        id: true
      }
    });
  } catch {
    return res.status(403).end();
  }

  if (user.role !== 'TEACHER') {
    return res.status(403).end();
  }

  try {
    classroom = await prisma.classroom.findUniqueOrThrow({
      where: {
        classroomId: data.classroomId
      },
      select: {
        classroomTeacherId: true
      }
    });
  } catch {
    return res.status(400).end();
  }

  // Teachers can only edit their own classes (same check as deleteclass).
  if (user.id !== classroom.classroomTeacherId) {
    return res.status(403).end();
  }

  if (
    data.classroomName === undefined &&
    data.description === undefined &&
    data.fccCertifications === undefined
  ) {
    return res.status(304).end();
  }

  const editClassInDB = await prisma.classroom.update({
    where: {
      classroomId: data.classroomId
    },
    data: {
      classroomName: data.classroomName,
      description: data.description,
      fccCertifications: data.fccCertifications
    }
  });
  return res.json(editClassInDB);
}
