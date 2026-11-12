import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireMethod } from '../../util/apiAuth';
import { isRecord } from '../../util/classroomValidation';
import { readString, requireOwnedClassroom } from '../../util/teacherClassroom';

const DECISIONS = ['approve', 'decline'] as const;
type Decision = (typeof DECISIONS)[number];

/**
 * Approves or declines a pending join request (classes in "Ask to join"
 * mode). Approving moves the student from the requests list to the roster.
 * Declining only clears the request, so the student can ask again later.
 */
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'PUT')) return;

  const body: unknown = req.body;
  const classroomId = isRecord(body) ? readString(body.classroomId) : null;
  const userId = isRecord(body) ? readString(body.userId) : null;
  const decision = isRecord(body) ? body.decision : null;
  if (!classroomId || !userId || !DECISIONS.includes(decision as Decision)) {
    return res.status(400).json({
      error:
        'Request body must include classroomId, userId and a decision of "approve" or "decline"'
    });
  }

  const teacher = await requireOwnedClassroom(req, res, classroomId);
  if (!teacher) return;

  // Each branch is one atomic statement that only matches while the request
  // is still pending, so two clicks (or two tabs) can't apply it twice.
  const updated =
    decision === 'approve'
      ? await prisma.$executeRaw`
          UPDATE "Classroom"
          SET "pendingUserIds" = array_remove("pendingUserIds", ${userId}),
              "fccUserIds" = CASE
                WHEN ${userId} = ANY(COALESCE("fccUserIds", ARRAY[]::TEXT[]))
                  THEN "fccUserIds"
                ELSE array_append("fccUserIds", ${userId})
              END
          WHERE "classroomId" = ${classroomId}
            AND "classroomTeacherId" = ${teacher.id}
            AND ${userId} = ANY("pendingUserIds")`
      : await prisma.$executeRaw`
          UPDATE "Classroom"
          SET "pendingUserIds" = array_remove("pendingUserIds", ${userId})
          WHERE "classroomId" = ${classroomId}
            AND "classroomTeacherId" = ${teacher.id}
            AND ${userId} = ANY("pendingUserIds")`;

  if (updated === 0) {
    return res.status(404).json({ error: 'Join request not found' });
  }
  return res.status(200).json({ success: true });
}
