import prisma from '../../../../prisma/prisma';
import { randomBytes } from 'crypto';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../../util/inviteApiUtils';

const INVITE_EXPIRY_DAYS = 7;

const buildExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  return expiresAt;
};

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'POST')) {
    return;
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
      invitedTeacherEmail: true,
      status: true
    }
  });

  if (!existingInvitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (existingInvitation.status === 'ACCEPTED') {
    return res.status(409).json({
      error: 'Accepted invitations cannot be resent',
      status: existingInvitation.status
    });
  }

  const refreshedToken = randomBytes(24).toString('hex');
  const resentInvitation = await prisma.teacherInvitation.update({
    where: {
      teacherInvitationId
    },
    data: {
      inviteToken: refreshedToken,
      expiresAt: buildExpiryDate(),
      status: 'PENDING'
    },
    select: {
      teacherInvitationId: true,
      invitedTeacherEmail: true,
      status: true,
      expiresAt: true,
      updatedAt: true,
      inviteToken: true
    }
  });

  return res.status(200).json({
    invitation: resentInvitation
  });
}
