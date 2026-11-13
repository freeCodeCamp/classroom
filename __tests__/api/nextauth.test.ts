import { describe, expect, it } from 'vitest';
import type { Account, Profile, User } from 'next-auth';

vi.mock('../../prisma/prisma', () => ({ __esModule: true, default: {} }));

const { authOptions } = await import('../../pages/api/auth/[...nextauth]');

const account: Account = {
  provider: 'auth0',
  type: 'oauth',
  providerAccountId: 'auth0|123'
};
const user: User = {
  id: 'user-1',
  email: 'student@example.org',
  role: 'NONE'
};

const signIn = (profile: Profile | undefined) => {
  const callback = authOptions.callbacks?.signIn;
  if (!callback) throw new Error('Expected a signIn callback');
  return callback({ user, account, profile });
};

describe('authOptions signIn', () => {
  it('allows an Auth0 profile with a verified email', async () => {
    const profile = { email: user.email, email_verified: true } as Profile;
    expect(await signIn(profile)).toBe(true);
  });

  it('denies an Auth0 profile with an unverified email', async () => {
    const profile = { email: user.email, email_verified: false } as Profile;
    expect(await signIn(profile)).toBe(false);
  });

  it('denies an Auth0 profile without the email_verified claim', async () => {
    expect(await signIn({ email: user.email ?? undefined })).toBe(false);
  });

  it('denies a sign-in without a profile', async () => {
    expect(await signIn(undefined)).toBe(false);
  });
});
