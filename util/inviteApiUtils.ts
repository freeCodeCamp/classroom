import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../prisma/prisma';
import type { User } from '../generated/prisma/client';
import type {
  PaginationRequest,
  RequireAuthenticatedUserOptions
} from '../types/invite';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const normalizeEmail = (
  email: string | null | undefined
): string | undefined => email?.trim().toLowerCase();

const normalizeGmailLocalPart = (localPart: string): string => {
  const withoutPlus = localPart.split('+')[0];
  return withoutPlus.replace(/\./g, '');
};

const normalizeInviteComparableEmail = (
  email: string | null | undefined
): string | undefined => {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@')) {
    return normalized;
  }

  const [localPart, domain] = normalized.split('@');

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${normalizeGmailLocalPart(localPart)}@gmail.com`;
  }

  return normalized;
};

export const areEquivalentInviteEmails = (
  firstEmail: string | null | undefined,
  secondEmail: string | null | undefined
): boolean => {
  return (
    normalizeInviteComparableEmail(firstEmail) ===
    normalizeInviteComparableEmail(secondEmail)
  );
};

export const isValidEmail = (email: string | null | undefined): boolean =>
  EMAIL_PATTERN.test(email || '');

export const parsePagination = (
  req: PaginationRequest,
  defaultLimit = 50,
  maxLimit = 200
): { limit: number; offset: number } => {
  const parsedLimit = Number.parseInt(String(req.query.limit), 10);
  const parsedOffset = Number.parseInt(String(req.query.offset), 10);

  const limit = Number.isNaN(parsedLimit)
    ? defaultLimit
    : Math.min(Math.max(parsedLimit, 1), maxLimit);
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);

  return { limit, offset };
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
