import prisma from '../../../../prisma/prisma';
import { randomBytes } from 'crypto';
import {
  isValidEmail,
  normalizeEmail,
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

  const invitedTeacherEmail = normalizeEmail(req.body?.invitedTeacherEmail);

  if (!invitedTeacherEmail) {
    return res.status(400).json({ error: 'invitedTeacherEmail is required' });
  }

  if (!isValidEmail(invitedTeacherEmail)) {
    return res.status(400).json({ error: 'invitedTeacherEmail must be valid' });
  }

  const pendingInvite = await prisma.teacherInvitation.findFirst({
    where: {
      invitedTeacherEmail,
      status: 'PENDING',
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      teacherInvitationId: true,
      expiresAt: true
    }
  });

  if (pendingInvite) {
    return res.status(409).json({
      error: 'Active invitation already exists',
      invitation: pendingInvite
    });
  }

  const inviteToken = randomBytes(24).toString('hex');
  const createdInvitation = await prisma.teacherInvitation.create({
    data: {
      invitedTeacherEmail,
      inviteToken,
      invitedById: currentUser.id,
      status: 'PENDING',
      expiresAt: buildExpiryDate()
    },
    select: {
      teacherInvitationId: true,
      invitedTeacherEmail: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      inviteToken: true
    }
  });

  const inviteUrl = buildTeacherInviteUrl(req, createdInvitation.inviteToken);

  try {
    await sendTeacherInvitationEmail({
      req,
      invitedTeacherEmail,
      inviteUrl,
      expiresAt: createdInvitation.expiresAt,
      invitedByEmail: currentUser.email
    });
  } catch (error) {
    console.error('Failed to send teacher invite email', error);

    await prisma.teacherInvitation
      .delete({
        where: {
          teacherInvitationId: createdInvitation.teacherInvitationId
        }
      })
      .catch(deleteError => {
        console.error(
          'Failed to rollback teacher invitation after email failure',
          deleteError
        );
      });

    return res.status(502).json({
      error: `Teacher invitation email could not be sent. ${error?.message || 'Please verify SMTP configuration and try again.'}`
    });
  }

  return res.status(201).json({
    invitation: createdInvitation
  });
}
