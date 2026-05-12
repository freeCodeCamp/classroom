import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../prisma/prisma';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireMethod = (req, res, method) => {
  if (req.method !== method) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
};

export const normalizeEmail = email => email?.trim().toLowerCase();

const normalizeGmailLocalPart = localPart => {
  const withoutPlus = localPart.split('+')[0];
  return withoutPlus.replace(/\./g, '');
};

const normalizeInviteComparableEmail = email => {
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

export const areEquivalentInviteEmails = (firstEmail, secondEmail) => {
  return (
    normalizeInviteComparableEmail(firstEmail) ===
    normalizeInviteComparableEmail(secondEmail)
  );
};

export const isValidEmail = email => EMAIL_PATTERN.test(email || '');

export const parsePagination = (req, defaultLimit = 50, maxLimit = 200) => {
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const parsedOffset = Number.parseInt(req.query.offset, 10);

  const limit = Number.isNaN(parsedLimit)
    ? defaultLimit
    : Math.min(Math.max(parsedLimit, 1), maxLimit);
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);

  return { limit, offset };
};

export const requireAuthenticatedUser = async (
  req,
  res,
  { allowedRoles = null, roleError = 'Insufficient role' } = {}
) => {
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
