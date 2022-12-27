import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  let user;
  let userToBeChanged;

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
        role: true
      }
    });
  } catch {
    return res.status(403).end();
  }

  //checks whether user is admin
  if (user.role !== 'ADMIN') {
    return res.status(403).end();
  }

  const body = req.body;

  try {
    userToBeChanged = await prisma.user.findUniqueOrThrow({
      where: {
        id: body.id
      },
      select: {
        role: true
      }
    });
  } catch {
    return res.status(403).end();
  }

  if (body.name.length === 0) {
    body.name = undefined;
  }

  if (body.email.length === 0) {
    body.email = undefined;
  }

  if (body.role.length === 0) {
    body.role = undefined;
  }

  //If user attempts to change a role from Admin to non-Admin, then the change will be denied.
  if (userToBeChanged.role === 'ADMIN' && body.role !== 'ADMIN') {
    return res.status(403).end();
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

  return res.status(200).end();
}
