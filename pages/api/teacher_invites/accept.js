import prisma from '../../../prisma/prisma';
import {
  areEquivalentInviteEmails,
  normalizeEmail,
  requireAuthenticatedUser,
  requireMethod
} from '../../../util/inviteApiUtils';
import { isTeacherInvitesEnabled } from '../../../util/featureFlags';

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'POST')) {
    return;
  }

  if (!isTeacherInvitesEnabled()) {
    return res
      .status(404)
      .json({ error: 'Teacher invites feature is disabled' });
  }

  const inviteToken = req.body?.inviteToken?.trim();
  if (!inviteToken) {
    return res.status(400).json({ error: 'inviteToken is required' });
  }

  const currentUser = await requireAuthenticatedUser(req, res);
  if (!currentUser) {
    return;
  }

  const sessionEmail = normalizeEmail(currentUser.email);

  if (!sessionEmail) {
    return res.status(403).json({ error: 'User email missing' });
  }

  const invitation = await prisma.teacherInvitation.findUnique({
    where: {
      inviteToken
    },
    select: {
      teacherInvitationId: true,
      invitedTeacherEmail: true,
      status: true,
      acceptedById: true,
      expiresAt: true
    }
  });

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (
    !areEquivalentInviteEmails(invitation.invitedTeacherEmail, sessionEmail)
  ) {
    return res.status(403).json({ error: 'Invitation email mismatch' });
  }

  if (invitation.status === 'ACCEPTED') {
    if (invitation.acceptedById && invitation.acceptedById !== currentUser.id) {
      return res
        .status(409)
        .json({ error: 'Invitation accepted by another user' });
    }

    return res.status(200).json({
      invitation: {
        teacherInvitationId: invitation.teacherInvitationId,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      },
      user: {
        id: currentUser.id,
        role: currentUser.role
      },
      alreadyAccepted: true
    });
  }

  if (invitation.status !== 'PENDING') {
    return res.status(409).json({
      error: 'Only pending invitations can be accepted',
      status: invitation.status
    });
  }

  if (new Date(invitation.expiresAt) <= new Date()) {
    await prisma.teacherInvitation.update({
      where: {
        teacherInvitationId: invitation.teacherInvitationId
      },
      data: {
        status: 'EXPIRED'
      }
    });

    return res.status(410).json({
      error: 'Invitation expired',
      status: 'EXPIRED'
    });
  }

  const targetRole = currentUser.role === 'ADMIN' ? 'ADMIN' : 'TEACHER';

  const [updatedInvitation, updatedUser] = await prisma.$transaction([
    prisma.teacherInvitation.update({
      where: {
        teacherInvitationId: invitation.teacherInvitationId
      },
      data: {
        status: 'ACCEPTED',
        acceptedById: currentUser.id
      },
      select: {
        teacherInvitationId: true,
        invitedTeacherEmail: true,
        status: true,
        expiresAt: true,
        updatedAt: true
      }
    }),
    prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        role: targetRole
      },
      select: {
        id: true,
        role: true,
        email: true
      }
    })
  ]);

  return res.status(200).json({
    invitation: updatedInvitation,
    user: updatedUser,
    alreadyAccepted: false
  });
}
