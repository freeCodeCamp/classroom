import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { fetchUserIdByEmail } from '../../util/fcc-api';

export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);

  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only PUT requests are allowed.'
    });
  }

  if (!session?.user?.email) {
    return res.status(403).json({
      success: false,
      error: 'NOT_AUTHENTICATED',
      message: 'You must be signed in to connect to a classroom.'
    });
  }

  const body = req.body || {};
  const classroomId = body.classroomId || body.join?.[0] || body.join;

  if (!classroomId || typeof classroomId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CLASSROOM_ID',
      message: 'A valid classroomId is required.'
    });
  }

  const userInfo = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true,
      role: true,
      fccProperUserId: true
    }
  });

  if (!userInfo) {
    return res.status(404).json({
      success: false,
      error: 'USER_NOT_FOUND',
      message: 'Could not find your Classroom user record.'
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

  let fccProperUserId = '';
  try {
    const { userId } = await fetchUserIdByEmail(session.user.email);
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
    userInfo.fccProperUserId !== fccProperUserId ||
    userInfo.role === 'NONE'
  ) {
    updates.push(
      prisma.user.update({
        where: {
          email: session.user.email
        },
        data: {
          fccProperUserId,
          ...(userInfo.role === 'NONE' ? { role: 'STUDENT' } : {})
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
    alreadyLinked: userInfo.fccProperUserId === fccProperUserId,
    alreadyInRoster: classroom.fccUserIds.includes(userInfo.id)
  });
}
