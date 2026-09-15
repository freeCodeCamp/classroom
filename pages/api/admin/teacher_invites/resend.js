import prisma from '../../../../prisma/prisma';
import { randomBytes } from 'crypto';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../../util/inviteApiUtils';
import {
  buildTeacherInviteUrl,
  sendTeacherInvitationEmail
} from '../../../../util/inviteEmail';
import { isTeacherInvitesEnabled } from '../../../../util/featureFlags';

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
      invitedTeacherEmail: true,
      status: true,
      inviteToken: true,
      expiresAt: true
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
  const refreshedExpiry = buildExpiryDate();
  const resentInvitation = await prisma.teacherInvitation.update({
    where: {
      teacherInvitationId
    },
    data: {
      inviteToken: refreshedToken,
      expiresAt: refreshedExpiry,
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

  const inviteUrl = buildTeacherInviteUrl(req, resentInvitation.inviteToken);

  try {
    await sendTeacherInvitationEmail({
      req,
      invitedTeacherEmail: resentInvitation.invitedTeacherEmail,
      inviteUrl,
      expiresAt: resentInvitation.expiresAt,
      invitedByEmail: currentUser.email
    });
  } catch (error) {
    console.error('Failed to resend teacher invitation email', error);

    await prisma.teacherInvitation
      .update({
        where: {
          teacherInvitationId
        },
        data: {
          inviteToken: existingInvitation.inviteToken,
          expiresAt: existingInvitation.expiresAt,
          status: existingInvitation.status
        }
      })
      .catch(updateError => {
        console.error(
          'Failed to rollback teacher invitation after resend email failure',
          updateError
        );
      });

    return res.status(502).json({
      error: `Teacher invitation email could not be resent. ${error?.message || 'Please verify SMTP configuration and try again.'}`
    });
  }

  return res.status(200).json({
    invitation: resentInvitation
  });
}
