import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireMethod } from '../../util/apiAuth';
import { isRecord } from '../../util/classroomValidation';
import { readString, requireOwnedClassroom } from '../../util/teacherClassroom';

/**
 * Removes a student from a class roster. Only the class's teacher can do it.
 * The student's account and freeCodeCamp progress are not touched, and they
 * can rejoin through the invite link if the class's join mode allows it.
 */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'DELETE')) return;

  const body: unknown = req.body;
  const classroomId = isRecord(body) ? readString(body.classroomId) : null;
  const studentEmail = isRecord(body) ? readString(body.studentEmail) : null;
  if (!classroomId || !studentEmail) {
    return res.status(400).json({
      error: 'Request body must include classroomId and studentEmail'
    });
  }

  const user = await requireOwnedClassroom(req, res, classroomId);
  if (!user) return;

  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
    select: { id: true }
  });
  if (!student) {
    return res.status(404).json({ error: 'Student not found in this class' });
  }

  // One atomic statement, so a student joining at the same moment is never
  // lost. The teacher check is repeated here in case ownership changed.
  const removed = await prisma.$executeRaw`
    UPDATE "Classroom"
    SET "fccUserIds" = array_remove("fccUserIds", ${student.id})
    WHERE "classroomId" = ${classroomId}
      AND "classroomTeacherId" = ${user.id}
      AND ${student.id} = ANY("fccUserIds")`;

  if (removed === 0) {
    return res.status(404).json({ error: 'Student not found in this class' });
  }
  return res.status(200).json({ success: true });
}
