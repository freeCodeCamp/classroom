import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!req.method == 'POST') {
    res.status(405).end();
  }

  if (!session) {
    res.status(403).end();
  }

  let users = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    select: {
      email: true
    }
  });

  if (!users.includes(session.email)) {
    res.status(403).end();
  }

  const body = JSON.parse(req.body);
  //if name and email are not in body, they will be undefined and prisma will not change those fields
  await prisma.user.update({
    where: {
      id: body.id
    },
    data: {
      name: body.name,
      email: body.email,
      role: 'TEACHER'
    }
  });

  res.status(200).end();
}
