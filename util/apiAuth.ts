import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../prisma/prisma';
import type { User } from '../generated/prisma/client';
import type { RequireAuthenticatedUserOptions } from '../types/invite';

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

export const requireAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  {
    allowedRoles = null,
    roleError = 'Insufficient role'
  }: RequireAuthenticatedUserOptions = {}
): Promise<Pick<User, 'id' | 'role' | 'email'> | null> => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(403).json({ error: 'Not authenticated' });
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    res.status(403).json({ error: roleError });
    return null;
  }

  return user;
};
