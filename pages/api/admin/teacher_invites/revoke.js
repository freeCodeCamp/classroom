import prisma from '../../../../prisma/prisma';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../../util/inviteApiUtils';
import { isTeacherInvitesEnabled } from '../../../../util/featureFlags';

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'POST')) {
    return;
  }

  if (!isTeacherInvitesEnabled()) {
    return res
      .status(404)
      .json({ error: 'Teacher invites feature is disabled' });
  }

  const currentUser = await requireAuthenticatedUser(req, res, {
    allowedRoles: ['ADMIN'],
    roleError: 'Admin role required'
  });
  if (!currentUser) {
    return;
  }

  const teacherInvitationId = req.body?.teacherInvitationId?.trim();
  if (!teacherInvitationId) {
    return res.status(400).json({ error: 'teacherInvitationId is required' });
  }

  const existingInvitation = await prisma.teacherInvitation.findUnique({
    where: {
      teacherInvitationId
    },
    select: {
      teacherInvitationId: true,
      status: true,
      invitedTeacherEmail: true
    }
  });

  if (!existingInvitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (existingInvitation.status !== 'PENDING') {
    return res.status(409).json({
      error: 'Only pending invitations can be revoked',
      status: existingInvitation.status
    });
  }

  const revokedInvitation = await prisma.teacherInvitation.update({
    where: {
      teacherInvitationId
    },
    data: {
      status: 'REVOKED'
    },
    select: {
      teacherInvitationId: true,
      invitedTeacherEmail: true,
      status: true,
      updatedAt: true
    }
  });

  return res.status(200).json({
    invitation: revokedInvitation
  });
}
