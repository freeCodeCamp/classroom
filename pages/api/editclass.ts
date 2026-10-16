import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'PUT')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER]
  });
  if (!user) return;
  const data = req.body;
  let classroom;

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
