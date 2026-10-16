import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import type { GetServerSidePropsContext } from 'next';
import prisma from '../../prisma/prisma';
import { getSessionUser } from '../../util/pageAuth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn()
}));
vi.mock('../../pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));
vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: { user: { findUnique: vi.fn() } }
}));

const ctx = { req: {}, res: {} } as unknown as GetServerSidePropsContext;

describe('getSessionUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect(await getSessionUser(ctx)).toBeNull();
  });

  it('returns null without querying the database when the session has no email', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'No Email' }
    } as unknown as Session);

    expect(await getSessionUser(ctx)).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns null when the session email has no database row', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'ghost@example.org' }
    } as unknown as Session);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    expect(await getSessionUser(ctx)).toBeNull();
  });

  it('returns the session and the database user when both exist', async () => {
    const session = {
      user: { email: 'teacher@example.org' }
    } as unknown as Session;
    const user = {
      id: 'teacher-1',
      email: 'teacher@example.org',
      role: 'TEACHER'
    };
    vi.mocked(getServerSession).mockResolvedValue(session);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      user as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>
    );

    expect(await getSessionUser(ctx)).toEqual({ session, user });
  });
});
