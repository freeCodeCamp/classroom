import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.ADMIN]
  });
  if (!user) return;
  let userToBeChanged;

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
  if (userToBeChanged.role === Role.ADMIN && body.role !== Role.ADMIN) {
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
