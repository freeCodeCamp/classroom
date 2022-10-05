import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!req.method == 'DELETE') {
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

  let classroom = await prisma.classroom.findUniqueOrThrow({
    where: {
      classroomId: data
    }
  });

  //makes sure teacher can only delete their own class
  if (user.role === 'TEACHER' && user.id !== classroom.classroomTeacherId) {
    res.status(403).end();
  }

  const deleteClass = await prisma.classroom.delete({
    where: {
      classroomId: data
    }
  });

  res.json(deleteClass);
}
