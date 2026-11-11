import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../prisma/prisma';
import { requireAuthenticatedUser } from './apiAuth';
import type { AuthenticatedUser } from './apiAuth';
import { Role } from './roles';

/**
 * For roster endpoints: requires a signed-in teacher who owns the class.
 * Sends the error response (401, 403 or 404) and returns null otherwise.
 * The caller checks the method and the body first.
 */
export const requireOwnedClassroom = async (
  req: NextApiRequest,
  res: NextApiResponse,
  classroomId: string
): Promise<AuthenticatedUser | null> => {
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.TEACHER]
  });
  if (!user) return null;

  const classroom = await prisma.classroom.findUnique({
    where: { classroomId },
    select: { classroomTeacherId: true }
  });
  if (!classroom) {
    res.status(404).json({ error: 'Classroom not found' });
    return null;
  }
  if (classroom.classroomTeacherId !== user.id) {
    res.status(403).json({ error: 'You do not own this classroom' });
    return null;
  }
  return user;
};

/** A non-empty string from a JSON body, or null. */
export const readString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
