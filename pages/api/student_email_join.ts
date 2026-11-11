import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { fetchUserIdByEmail } from '../../util/fcc-api';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';
import { JoinMode } from '../../util/joinModes';

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
      fccUserIds: true,
      pendingUserIds: true,
      joinMode: true
    }
  });

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'CLASSROOM_NOT_FOUND',
      message: 'We could not find that classroom.'
    });
  }

  // Students already in the class can always reconnect (to relink their
  // account). Everyone else is subject to the class's join mode.
  const alreadyInRoster = classroom.fccUserIds.includes(userInfo.id);
  const alreadyPending = (classroom.pendingUserIds ?? []).includes(userInfo.id);
  if (
    !alreadyInRoster &&
    !alreadyPending &&
    classroom.joinMode === JoinMode.CLOSED
  ) {
    return res.status(403).json({
      success: false,
      error: 'CLASSROOM_CLOSED',
      message: "This class isn't accepting new students."
    });
  }
  // In "Ask to join" mode a new student is added to the requests list, and
  // the teacher moves them to the roster by approving the request. A request
  // made before the class was closed stays pending.
  const needsApproval =
    !alreadyInRoster && classroom.joinMode !== JoinMode.OPEN;

  const linked = await prisma.user.findUnique({
    where: { id: userInfo.id },
    select: { fccProperUserId: true }
  });
  const previousFccProperUserId = linked?.fccProperUserId ?? null;

  // Mock mode (no FCC_API_URL, local development) has no freeCodeCamp
  // account to link, so it skips the lookup and keeps the stored ID.
  const useFccApi = Boolean(process.env.FCC_API_URL);
  let fccProperUserId = previousFccProperUserId;
  if (useFccApi) {
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
          "We couldn't find a freeCodeCamp account for your email, or Classroom access isn't enabled in your freeCodeCamp settings."
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
          "We couldn't find a freeCodeCamp account for your email, or Classroom access isn't enabled in your freeCodeCamp settings."
      });
    }
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

  if (needsApproval) {
    if (!alreadyPending) {
      updates.push(
        prisma.classroom.update({
          where: {
            classroomId
          },
          data: {
            pendingUserIds: { push: userInfo.id }
          }
        })
      );
    }
  } else if (!alreadyInRoster) {
    updates.push(
      prisma.classroom.update({
        where: {
          classroomId
        },
        data: {
          fccUserIds: { push: userInfo.id },
          // A request left over from "Ask to join" mode is no longer needed
          // once the class is open and the student has joined.
          ...(alreadyPending
            ? {
                pendingUserIds: {
                  set: (classroom.pendingUserIds ?? []).filter(
                    id => id !== userInfo.id
                  )
                }
              }
            : {})
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
    alreadyInRoster,
    status: needsApproval ? 'PENDING' : 'JOINED'
  });
}
