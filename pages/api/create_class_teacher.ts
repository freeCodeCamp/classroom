import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';
import { getClassroomValidationError } from '../../util/classroomValidation';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER]
  });
  if (!user) return;
  const validationError = getClassroomValidationError(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const data = req.body;

  if (user.id !== data['classroomTeacherId']) {
    return res.status(403).end();
  }

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['classroomName'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });
  return res.json(createClassInDB);
}
