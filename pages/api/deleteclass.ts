import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'DELETE')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER, Role.ADMIN]
  });
  if (!user) return;
  let classroom;

  const data = req.body;

  try {
    classroom = await prisma.classroom.findUniqueOrThrow({
      where: {
        classroomId: data
      }
    });
  } catch {
    return res.status(400).end();
  }

  //makes sure teacher can only delete their own class
  if (user.role === Role.TEACHER && user.id !== classroom.classroomTeacherId) {
    return res.status(403).end();
  }

  await prisma.classroom.delete({
    where: {
      classroomId: data
    }
  });

  return res.status(200).end();
}
