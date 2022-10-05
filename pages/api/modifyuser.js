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

  //checks whether user is admin
  if (user.role !== 'ADMIN') {
    res.status(403).end();
  }

  const body = req.body;

  if (body.name.length === 0) {
    body.name = undefined;
  }

  if (body.email.length === 0) {
    body.email = undefined;
  }

  if (body.role.length === 0) {
    body.role = undefined;
  }

  //if any parameter is undefined/null then prisma will not change it
  await prisma.user.update({
    where: {
      id: body.id
    },
    data: {
      name: body.name,
      email: body.email,
      role: body.role
    }
  });

  res.status(200).end();
}
