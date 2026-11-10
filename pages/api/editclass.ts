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
  if (!requireMethod(req, res, 'PUT')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER]
  });
  if (!user) return;
  // Only the shape needed to find the class is checked before ownership. The
  // name and description are validated after it, so a teacher who doesn't own
  // the class always gets 403, whatever the rest of the body contains.
  const data = req.body;
  if (!isRecord(data) || typeof data.classroomId !== 'string') {
    return res
      .status(400)
      .json({ error: 'Request body must include a classroomId' });
  }
  const { classroomId } = data;
  let classroom;

  try {
    classroom = await prisma.classroom.findUniqueOrThrow({
      where: {
        classroomId
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

  const { error, fields } = parseClassroomTextFields(data, true);
  if (error !== undefined) {
    return res.status(400).json({ error });
  }

  if (
    fields.classroomName === undefined &&
    fields.description === undefined &&
    data.fccCertifications === undefined
  ) {
    return res.status(304).end();
  }

  const editClassInDB = await prisma.classroom.update({
    where: {
      classroomId
    },
    data: {
      classroomName: fields.classroomName,
      description: fields.description,
      // Not validated yet; passed through unchanged, as before.
      fccCertifications: data.fccCertifications as string[] | undefined
    }
  });
  return res.json(editClassInDB);
}
