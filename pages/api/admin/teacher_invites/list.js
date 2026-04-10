import prisma from '../../../../prisma/prisma';
import {
  parsePagination,
  requireAuthenticatedUser,
  requireMethod
} from '../../../../util/inviteApiUtils';

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'GET')) {
    return;
  }

  const currentUser = await requireAuthenticatedUser(req, res, {
    allowedRoles: ['ADMIN'],
    roleError: 'Admin role required'
  });
  if (!currentUser) {
    return;
  }

  const { limit, offset } = parsePagination(req);

  const [invitations, total] = await Promise.all([
    prisma.teacherInvitation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
      select: {
        teacherInvitationId: true,
        invitedTeacherEmail: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        acceptedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    }),
    prisma.teacherInvitation.count()
  ]);

  return res.status(200).json({
    invitations,
    pagination: {
      total,
      limit,
      offset
    }
  });
}
