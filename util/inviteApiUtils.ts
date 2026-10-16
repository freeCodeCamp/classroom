import type { PaginationRequest } from '../types/invite';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
