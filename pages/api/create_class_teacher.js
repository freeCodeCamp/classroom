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

  //checks whether user is teacher/admin
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    res.status(403).end();
  }

  const data = JSON.parse(req.body);

  //makes sure teacher is only creating class for themselves
  if (user.role === 'TEACHER' && user.id !== data['classroomTeacherId']) {
    res.status(403).end();
  }

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });

  res.json(createClassInDB);
}
