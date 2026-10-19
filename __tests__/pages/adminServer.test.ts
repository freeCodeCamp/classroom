import { getServerSideProps as getAdminProps } from '../../pages/admin/index';
import { getServerSideProps as getActionsProps } from '../../pages/admin/actions/[id]';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import prisma from '../../prisma/prisma';
import { getSessionUser } from '../../util/pageAuth';
import type { SessionUser } from '../../util/pageAuth';

vi.mock('../../util/pageAuth', () => ({ getSessionUser: vi.fn() }));
vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: { findMany: vi.fn(), findUnique: vi.fn() }
  }
}));

const context = {
  params: { id: 'target-1' }
} as unknown as GetServerSidePropsContext;

const sessionUser = (role: SessionUser['user']['role']): SessionUser => ({
  session: { user: { email: 'who@example.org' } } as unknown as Session,
  user: { id: 'who-1', email: 'who@example.org', role }
});

const errorRedirect = {
  redirect: { destination: '/error', permanent: false }
};

describe('admin page getServerSideProps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /error when there is no session user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect(await getAdminProps(context)).toEqual(errorRedirect);
  });

  it('redirects a TEACHER to /error', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(sessionUser('TEACHER'));

    expect(await getAdminProps(context)).toEqual(errorRedirect);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('returns the user list for an ADMIN', async () => {
    const users = [
      { id: 'a', name: 'A', email: 'a@example.org', role: 'ADMIN' },
      { id: 'b', name: 'B', email: 'b@example.org', role: 'TEACHER' }
    ];
    vi.mocked(getSessionUser).mockResolvedValue(sessionUser('ADMIN'));
    vi.mocked(prisma.user.findMany).mockResolvedValue(
      users as unknown as Awaited<ReturnType<typeof prisma.user.findMany>>
    );

    const result = (await getAdminProps(context)) as unknown as {
      props: { users: unknown[] };
    };

    expect(result.props.users).toEqual(users);
  });
});

describe('admin actions page getServerSideProps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /error when there is no session user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect(await getActionsProps(context)).toEqual(errorRedirect);
  });

  it('redirects a TEACHER to /error', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(sessionUser('TEACHER'));

    expect(await getActionsProps(context)).toEqual(errorRedirect);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns notFound when the target user does not exist', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(sessionUser('ADMIN'));
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    expect(await getActionsProps(context)).toEqual({ notFound: true });
  });

  it('returns the target user for an ADMIN', async () => {
    const userInfo = {
      id: 'target-1',
      name: 'T',
      email: 't@example.org',
      role: 'STUDENT'
    };
    vi.mocked(getSessionUser).mockResolvedValue(sessionUser('ADMIN'));
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      userInfo as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>
    );

    expect(await getActionsProps(context)).toEqual({ props: { userInfo } });
  });
});
