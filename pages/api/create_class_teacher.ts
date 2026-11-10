import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';
import {
  isRecord,
  parseClassroomTextFields
} from '../../util/classroomValidation';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER]
  });
  if (!user) return;
  const data = req.body;
  if (!isRecord(data)) {
    return res.status(400).json({ error: 'Request body must be an object' });
  }

  // Teachers can only create classes for themselves. This is checked before
  // the name and description, so the answer is 403 whatever the text is.
  if (user.id !== data['classroomTeacherId']) {
    return res.status(403).end();
  }

  const { error, fields } = parseClassroomTextFields(data);
  if (error !== undefined) {
    return res.status(400).json({ error });
  }

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: fields.classroomName,
      description: fields.description,
      classroomTeacherId: data['classroomTeacherId'],
      // Not validated yet; passed through unchanged, as before.
      fccCertifications: data['fccCertifications'] as string[] | undefined
    }
  });
  return res.json(createClassInDB);
}
