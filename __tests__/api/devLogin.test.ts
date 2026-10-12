vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      upsert: vi.fn()
    },
    session: {
      create: vi.fn()
    }
  }
}));

import prisma from '../../prisma/prisma';
import handler from '../../pages/api/auth/dev-login';
import type { User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const createRes = () => {
  const res = createMockRes();
  const redirect = vi.fn();
  res.redirect = redirect;
  return { res, redirect };
};

const createReq = (query: Record<string, string | string[]>, method = 'GET') =>
  createMockReq({ method, query });

const enableDevMode = () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', 'true');
  vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3001');
};

describe('GET /api/auth/dev-login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.upsert).mockResolvedValue({
      id: 'test-user-id'
    } as unknown as User);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 404 in production even when the flag is true', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', 'true');
    const { res } = createRes();

    await handler(createReq({ email: 'teacher@classroom.local' }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('returns 404 in development when the flag is false', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', 'false');
    const { res } = createRes();

    await handler(createReq({ email: 'teacher@classroom.local' }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('returns 404 in development when the flag is unset', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', undefined);
    const { res } = createRes();

    await handler(createReq({ email: 'teacher@classroom.local' }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('returns 405 and an Allow header for POST', async () => {
    enableDevMode();
    const { res } = createRes();

    await handler(createReq({}, 'POST'), res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid email', async () => {
    enableDevMode();
    const { res } = createRes();

    await handler(createReq({ email: 'not-an-email' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email' });
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('returns 400 for an array email', async () => {
    enableDevMode();
    const { res } = createRes();

    await handler(
      createReq({ email: ['a@classroom.local', 'b@classroom.local'] }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  describe('success', () => {
    it('upserts the user by email', async () => {
      enableDevMode();
      const { res } = createRes();

      await handler(
        createReq({
          email: 'teacher@classroom.local',
          callbackUrl: '/classes'
        }),
        res
      );

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'teacher@classroom.local' },
        create: { email: 'teacher@classroom.local', name: 'teacher' },
        update: {}
      });
    });

    it('creates a 30 day database session with a 64 hex character token', async () => {
      enableDevMode();
      const { res } = createRes();

      await handler(
        createReq({
          email: 'teacher@classroom.local',
          callbackUrl: '/classes'
        }),
        res
      );

      const args = vi.mocked(prisma.session.create).mock.calls[0][0];
      expect(args.data.userId).toBe('test-user-id');
      expect(args.data.sessionToken).toMatch(/^[0-9a-f]{64}$/);
      const expected = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const expires = args.data.expires;
      expect(expires).toBeInstanceOf(Date);
      expect(Math.abs(new Date(expires).getTime() - expected)).toBeLessThan(
        60 * 1000
      );
    });

    it('sets a non-secure session cookie with the same token', async () => {
      enableDevMode();
      const { res } = createRes();

      await handler(
        createReq({
          email: 'teacher@classroom.local',
          callbackUrl: '/classes'
        }),
        res
      );

      const { sessionToken } = vi.mocked(prisma.session.create).mock.calls[0][0]
        .data;
      const cookieCall = res.setHeader.mock.calls.find(
        ([name]) => name === 'Set-Cookie'
      );
      const cookie = cookieCall?.[1];
      expect(typeof cookie).toBe('string');
      expect(
        cookie.startsWith(`next-auth.session-token=${sessionToken};`)
      ).toBe(true);
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Expires=');
      expect(cookie).not.toContain('Secure');
    });

    it('redirects to the callback path', async () => {
      enableDevMode();
      const { res, redirect } = createRes();

      await handler(
        createReq({
          email: 'teacher@classroom.local',
          callbackUrl: '/classes'
        }),
        res
      );

      expect(redirect).toHaveBeenCalledWith(302, '/classes');
    });

    it('uses the default email when email is absent', async () => {
      enableDevMode();
      const { res } = createRes();

      await handler(createReq({}), res);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'teacher@classroom.local' },
        create: { email: 'teacher@classroom.local', name: 'teacher' },
        update: {}
      });
    });

    it('uses the secure cookie name and flag for an https NEXTAUTH_URL', async () => {
      enableDevMode();
      vi.stubEnv('NEXTAUTH_URL', 'https://example.org');
      const { res } = createRes();

      await handler(createReq({ email: 'teacher@classroom.local' }), res);

      const { sessionToken } = vi.mocked(prisma.session.create).mock.calls[0][0]
        .data;
      const cookieCall = res.setHeader.mock.calls.find(
        ([name]) => name === 'Set-Cookie'
      );
      const cookie = cookieCall?.[1];
      expect(
        cookie.startsWith(`__Secure-next-auth.session-token=${sessionToken};`)
      ).toBe(true);
      expect(cookie).toContain('; Secure');
    });

    it('redirects to / for an unsafe callbackUrl', async () => {
      enableDevMode();
      const { res, redirect } = createRes();

      await handler(
        createReq({
          email: 'teacher@classroom.local',
          callbackUrl: '/\\evil.example'
        }),
        res
      );

      expect(redirect).toHaveBeenCalledWith(302, '/');
    });
  });
});
