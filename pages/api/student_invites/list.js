import prisma from '../../../prisma/prisma';
import {
  parsePagination,
  requireAuthenticatedUser,
  requireMethod
} from '../../../util/inviteApiUtils';

export default async function handle(req, res) {
  if (!requireMethod(req, res, 'GET')) {
    return;
  }

  const currentUser = await requireAuthenticatedUser(req, res, {
    allowedRoles: ['TEACHER', 'ADMIN'],
    roleError: 'Teacher or admin role required'
  });
  if (!currentUser) {
    return;
  }

  const { limit, offset } = parsePagination(req);
  const classroomId = req.query.classroomId?.trim();

  const where = {};
  if (classroomId) {
    where.classroomId = classroomId;
  }

  if (currentUser.role === 'TEACHER') {
    where.classroom = {
      classroomTeacherId: currentUser.id
    };
  }

  const [invitations, total] = await Promise.all([
    prisma.studentInvitation.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
      select: {
        studentInvitationId: true,
        invitedStudentEmail: true,
        classroomId: true,
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
        },
        classroom: {
          select: {
            classroomId: true,
            classroomName: true,
            classroomTeacherId: true
          }
        }
      }
    }),
    prisma.studentInvitation.count({ where })
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
