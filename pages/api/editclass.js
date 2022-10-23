import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  const data = req.body;

  if (!req.method == 'PUT') {
    res.status(405).end();
  }

  if (!session) {
    res.status(403).end();
  }

  if (data.fccCertifications.length === 0) {
    data.fccCertifications = undefined;
  }

  if (
    data.className === undefined &&
    data.description === undefined &&
    data.fccCertifications === undefined
  ) {
    return res.status(304).end();
  }

  await prisma.classroom.update({
    where: {
      classroomId: data.classroomId
    },
    data: {
      classroomName: data.className,
      description: data.description,
      fccCertifications: data.fccCertifications
    }
  });
  return res.status(200).end();
}
