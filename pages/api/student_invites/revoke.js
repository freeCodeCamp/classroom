import prisma from '../../../prisma/prisma';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../util/inviteApiUtils';

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'POST')) {
    return;
  }

  const currentUser = await requireAuthenticatedUser(req, res, {
    allowedRoles: ['TEACHER', 'ADMIN'],
    roleError: 'Teacher or admin role required'
  });
  if (!currentUser) {
    return;
  }

  const studentInvitationId = req.body?.studentInvitationId?.trim();
  if (!studentInvitationId) {
    return res.status(400).json({ error: 'studentInvitationId is required' });
  }

  const invitation = await prisma.studentInvitation.findUnique({
    where: {
      studentInvitationId
    },
    select: {
      studentInvitationId: true,
      status: true,
      classroom: {
        select: {
          classroomTeacherId: true
        }
      }
    }
  });

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (
    currentUser.role === 'TEACHER' &&
    invitation.classroom.classroomTeacherId !== currentUser.id
  ) {
    return res.status(403).json({ error: 'Not allowed for this classroom' });
  }

  if (invitation.status !== 'PENDING') {
    return res.status(409).json({
      error: 'Only pending invitations can be revoked',
      status: invitation.status
    });
  }

  const revokedInvitation = await prisma.studentInvitation.update({
    where: {
      studentInvitationId
    },
    data: {
      status: 'CANCELLED'
    },
    select: {
      studentInvitationId: true,
      status: true,
      updatedAt: true
    }
  });

  return res.status(200).json({
    invitation: revokedInvitation
  });
}
