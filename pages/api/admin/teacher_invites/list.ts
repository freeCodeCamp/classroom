import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prisma/prisma';
import { parsePagination } from '../../../../util/inviteApiUtils';
import {
  requireAuthenticatedUser,
  requireMethod
} from '../../../../util/apiAuth';
import { Role } from '../../../../util/roles';
import { isTeacherInvitesEnabled } from '../../../../util/featureFlags';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'GET')) {
    return;
  }

  if (!isTeacherInvitesEnabled()) {
    return res
      .status(404)
      .json({ error: 'Teacher invites feature is disabled' });
  }

  const currentUser = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.ADMIN],
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
