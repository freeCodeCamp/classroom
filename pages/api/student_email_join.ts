import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { fetchUserIdByEmail } from '../../util/fcc-api';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'PUT')) return;
  // No role restriction: a NONE user joining a class becomes a STUDENT below.
  const userInfo = await requireAuthenticatedUser(req, res);
  if (!userInfo) return;

  const body = req.body || {};
  const classroomId = body.classroomId || body.join?.[0] || body.join;

  if (!classroomId || typeof classroomId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CLASSROOM_ID',
      message: 'A valid classroomId is required.'
    });
  }

  const classroom = await prisma.classroom.findUnique({
    where: {
      classroomId
    },
    select: {
      fccUserIds: true
    }
  });

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'CLASSROOM_NOT_FOUND',
      message: 'We could not find that classroom.'
    });
  }

  const linked = await prisma.user.findUnique({
    where: { id: userInfo.id },
    select: { fccProperUserId: true }
  });
  const previousFccProperUserId = linked?.fccProperUserId ?? null;

  let fccProperUserId = '';
  try {
    const { userId } = await fetchUserIdByEmail(userInfo.email);
    fccProperUserId = userId?.trim() || '';
  } catch (err) {
    // fetchUserIdByEmail threw — the FCC API returned a non-ok response
    // (e.g. 401 bad token, 500 server error, or a network failure).
    return res.status(502).json({
      success: false,
      error: 'FCC_ID_NOT_FOUND',
      message:
        'Email not found on FCC Proper or Classroom permission is not enabled.'
    });
  }

  // Separate from the error above: the FCC API returned 200 but with an empty
  // userId, which means the account exists but the user has not enabled
  // Classroom mode on their fCC account. fetchUserIdByEmail does not throw in
  // this case, so the try/catch above does not catch it.
  if (!fccProperUserId) {
    return res.status(502).json({
      success: false,
      error: 'FCC_ID_NOT_FOUND',
      message:
        'Email not found on FCC Proper or Classroom permission is not enabled.'
    });
  }

  const updates = [];

  if (
    previousFccProperUserId !== fccProperUserId ||
    userInfo.role === Role.NONE
  ) {
    updates.push(
      prisma.user.update({
        where: {
          id: userInfo.id
        },
        data: {
          fccProperUserId,
          ...(userInfo.role === Role.NONE ? { role: Role.STUDENT } : {})
        }
      })
    );
  }

  if (!classroom.fccUserIds.includes(userInfo.id)) {
    updates.push(
      prisma.classroom.update({
        where: {
          classroomId
        },
        data: {
          fccUserIds: { push: userInfo.id }
        }
      })
    );
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return res.status(200).json({
    success: true,
    fccProperUserId,
    classroomAppUserId: userInfo.id,
    alreadyLinked: previousFccProperUserId === fccProperUserId,
    alreadyInRoster: classroom.fccUserIds.includes(userInfo.id)
  });
}
