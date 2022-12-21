import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  let user;

  if (!req.method == 'POST') {
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

  //checks whether user is teacher/admin
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return res.status(403).end();
  }

  const data = req.body;

  //makes sure teacher is only creating class for themselves
  if (user.role === 'TEACHER' && user.id !== data['classroomTeacherId']) {
    return res.status(403).end();
  }

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });

  return res.json(createClassInDB);
}
