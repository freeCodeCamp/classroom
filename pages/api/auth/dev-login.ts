import { randomBytes } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/prisma';
import { safeCallbackPath } from '../../../util/safeCallbackPath';

const DEFAULT_EMAIL = 'teacher@classroom.local';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const devLoginEnabled =
    process.env.NODE_ENV !== 'production' &&
    process.env.FCC_ENABLE_DEV_LOGIN_MODE === 'true';

  if (!devLoginEnabled) {
    res.status(404).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }

  const rawEmail = req.query.email;
  const email = rawEmail === undefined ? DEFAULT_EMAIL : rawEmail;

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail, name: normalizedEmail.split('@')[0] },
    update: {}
  });

  const sessionToken = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);

  const secure = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');
  const name = `${secure ? '__Secure-' : ''}next-auth.session-token`;

  const existing = req.cookies[name];
  if (typeof existing === 'string' && existing !== '') {
    await prisma.session.deleteMany({ where: { sessionToken: existing } });
  }

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires }
  });

  const cookie = `${name}=${sessionToken}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);

  res.redirect(
    302,
    safeCallbackPath(
      req.query.callbackUrl,
      process.env.NEXTAUTH_URL ?? 'http://localhost'
    )
  );
}
