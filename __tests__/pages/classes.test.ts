vi.mock('../../util/pageAuth', () => ({
  getSessionUser: vi.fn()
}));

vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    classroom: {
      findMany: vi.fn()
    }
  }
}));

vi.mock(
  '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray',
  () => ({
    getAllTitlesAndDashedNamesSuperblockJSONArray: vi.fn().mockResolvedValue([])
  })
);

import { getSessionUser } from '../../util/pageAuth';
import prisma from '../../prisma/prisma';
import { getServerSideProps } from '../../pages/classes/index';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import type { Classroom } from '../../generated/prisma/client';
import type { ClassroomSummary } from '../../types/classroom';

const buildSessionUser = (
  email: string,
  overrides: Partial<
    NonNullable<Awaited<ReturnType<typeof getSessionUser>>>['user']
  >
): NonNullable<Awaited<ReturnType<typeof getSessionUser>>> => ({
  session: { user: { email } } as unknown as Session,
  user: { id: 'user-1', email, role: 'TEACHER', ...overrides }
});

const emptyContext = {} as unknown as GetServerSidePropsContext;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.classroom.findMany).mockResolvedValue([]);
});

// This gate only ever checks the requesting user's *current* `role` in the
// database - it has no notion of invitation history. So it's the single
// code path that covers every way someone can lack teacher access: never
// invited (role stays NONE/STUDENT), had a pending teacher invite revoked
// or left to expire before accepting, or was demoted/removed after
// previously being a teacher. Whatever the reason, if `role` isn't
// TEACHER when the request comes in, this is what stops them.
describe('pages/classes getServerSideProps access control', () => {
  it('redirects signed-out visitors to /error', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const result = await getServerSideProps(emptyContext);

    expect(result).toEqual({
      redirect: { destination: '/error', permanent: false }
    });
    expect(prisma.classroom.findMany).not.toHaveBeenCalled();
  });

  it('redirects to /error when the session has no matching database user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const result = await getServerSideProps(emptyContext);

    expect(result).toEqual({
      redirect: { destination: '/error', permanent: false }
    });
  });

  it.each(['NONE', 'STUDENT'])(
    'redirects a user without an accepted teacher invite (current role %s - whether never invited, or invited and then revoked/expired/demoted) to /error',
    async role => {
      vi.mocked(getSessionUser).mockResolvedValue(
        buildSessionUser('no-teacher-access@example.com', { role })
      );

      const result = await getServerSideProps(emptyContext);

      expect(result).toEqual({
        redirect: { destination: '/error', permanent: false }
      });
      expect(prisma.classroom.findMany).not.toHaveBeenCalled();
    }
  );

  it('redirects an ADMIN to /admin rather than the classes page', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(
      buildSessionUser('admin@example.com', { role: 'ADMIN' })
    );

    const result = await getServerSideProps(emptyContext);

    expect(result).toEqual({
      redirect: { destination: '/admin', permanent: false }
    });
  });

  it('lets an accepted TEACHER load the classes page', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(
      buildSessionUser('teacher@example.com', {
        id: 'teacher-1',
        role: 'TEACHER'
      })
    );
    vi.mocked(prisma.classroom.findMany).mockResolvedValue([
      {
        classroomName: 'Period 1',
        classroomId: 'room-1',
        description: null,
        createdAt: new Date('2026-01-01'),
        fccCertifications: []
      }
    ] as unknown as Classroom[]);

    const result = (await getServerSideProps(emptyContext)) as unknown as {
      redirect?: unknown;
      props: { user: string; classrooms: ClassroomSummary[] };
    };

    expect(result.redirect).toBeUndefined();
    expect(result.props.user).toBe('teacher-1');
    expect(result.props.classrooms).toHaveLength(1);
    expect(result.props.classrooms[0].classroomId).toBe('room-1');
  });
});
