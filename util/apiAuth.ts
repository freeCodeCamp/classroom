import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../prisma/prisma';
import type { User } from '../generated/prisma/client';
import type { Role } from './roles';

export const requireMethod = (
  req: NextApiRequest,
  res: NextApiResponse,
  method: string
): boolean => {
  if (req.method !== method) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
};

export type RequireAuthenticatedUserOptions = {
  allowedRoles?: Role[] | null;
  roleError?: string;
};

// The user was found by the session email, so email is never null here.
export type AuthenticatedUser = Pick<User, 'id' | 'role'> & { email: string };

export const requireAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  {
    allowedRoles = null,
    roleError = 'Insufficient role'
  }: RequireAuthenticatedUserOptions = {}
): Promise<AuthenticatedUser | null> => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true,
      role: true,
      email: true
    }
  });

  if (!user) {
    res.status(403).json({ error: 'User not found' });
    return null;
  }

  if (allowedRoles && !allowedRoles.some(role => role === user.role)) {
    res.status(403).json({ error: roleError });
    return null;
  }

  return { ...user, email: session.user.email };
};
