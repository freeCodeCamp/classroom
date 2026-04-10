import prisma from '../../../prisma/prisma';
import { randomBytes } from 'crypto';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../util/inviteApiUtils';

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
      invitedStudentEmail: true,
      status: true,
      classroom: {
        select: {
          classroomId: true,
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

  if (invitation.status === 'ACCEPTED') {
    return res.status(409).json({
      error: 'Accepted invitations cannot be resent',
      status: invitation.status
    });
  }

  const resentInvitation = await prisma.studentInvitation.update({
    where: {
      studentInvitationId
    },
    data: {
      inviteToken: randomBytes(24).toString('hex'),
      status: 'PENDING',
      expiresAt: buildExpiryDate()
    },
    select: {
      studentInvitationId: true,
      invitedStudentEmail: true,
      classroomId: true,
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
