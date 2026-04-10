import prisma from '../../../prisma/prisma';
import { randomBytes } from 'crypto';
import {
  isValidEmail,
  normalizeEmail,
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

  const invitedStudentEmail = normalizeEmail(req.body?.invitedStudentEmail);
  const classroomId = req.body?.classroomId?.trim();

  if (!invitedStudentEmail) {
    return res.status(400).json({ error: 'invitedStudentEmail is required' });
  }

  if (!isValidEmail(invitedStudentEmail)) {
    return res.status(400).json({ error: 'invitedStudentEmail must be valid' });
  }

  if (!classroomId) {
    return res.status(400).json({ error: 'classroomId is required' });
  }

  const classroom = await prisma.classroom.findUnique({
    where: {
      classroomId
    },
    select: {
      classroomId: true,
      classroomTeacherId: true
    }
  });

  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }

  // A teacher can only invite students to their own classroom.
  if (
    currentUser.role === 'TEACHER' &&
    classroom.classroomTeacherId !== currentUser.id
  ) {
    return res.status(403).json({ error: 'Not allowed for this classroom' });
  }

  const existingPendingInvite = await prisma.studentInvitation.findFirst({
    where: {
      invitedStudentEmail,
      classroomId,
      status: 'PENDING',
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      studentInvitationId: true,
      expiresAt: true
    }
  });

  if (existingPendingInvite) {
    return res.status(409).json({
      error: 'Active student invitation already exists',
      invitation: existingPendingInvite
    });
  }

  const createdInvitation = await prisma.studentInvitation.create({
    data: {
      invitedStudentEmail,
      classroomId,
      invitedById: currentUser.id,
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
      createdAt: true,
      inviteToken: true
    }
  });

  return res.status(201).json({
    invitation: createdInvitation
  });
}
