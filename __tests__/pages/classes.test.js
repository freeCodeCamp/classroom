jest.mock('next-auth/react', () => ({
  getSession: jest.fn()
}));

jest.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    User: {
      findMany: jest.fn()
    },
    Classroom: {
      findMany: jest.fn()
    }
  }
}));

jest.mock(
  '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray',
  () => ({
    getAllTitlesAndDashedNamesSuperblockJSONArray: jest
      .fn()
      .mockResolvedValue([])
  })
);

import { getSession } from 'next-auth/react';
import prisma from '../../prisma/prisma';
import { getServerSideProps } from '../../pages/classes/index';

const buildUser = overrides => ({
  id: 'user-1',
  role: 'TEACHER',
  ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
  prisma.Classroom.findMany.mockResolvedValue([]);
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
    getSession.mockResolvedValue(null);

    const result = await getServerSideProps({});

    expect(result).toEqual({
      redirect: { destination: '/error', permanent: false }
    });
    expect(prisma.User.findMany).not.toHaveBeenCalled();
  });

  it.each(['NONE', 'STUDENT'])(
    'redirects a user without an accepted teacher invite (current role %s - whether never invited, or invited and then revoked/expired/demoted) to /error',
    async role => {
      getSession.mockResolvedValue({
        user: { email: 'no-teacher-access@example.com' }
      });
      prisma.User.findMany.mockResolvedValue([buildUser({ role })]);

      const result = await getServerSideProps({});

      expect(result).toEqual({
        redirect: { destination: '/error', permanent: false }
      });
      expect(prisma.Classroom.findMany).not.toHaveBeenCalled();
    }
  );

  it('redirects an ADMIN to /admin rather than the classes page', async () => {
    getSession.mockResolvedValue({ user: { email: 'admin@example.com' } });
    prisma.User.findMany.mockResolvedValue([buildUser({ role: 'ADMIN' })]);

    const result = await getServerSideProps({});

    expect(result).toEqual({
      redirect: { destination: '/admin', permanent: false }
    });
  });

  it('lets an accepted TEACHER load the classes page', async () => {
    getSession.mockResolvedValue({ user: { email: 'teacher@example.com' } });
    prisma.User.findMany.mockResolvedValue([
      buildUser({ id: 'teacher-1', role: 'TEACHER' })
    ]);
    prisma.Classroom.findMany.mockResolvedValue([
      {
        classroomName: 'Period 1',
        classroomId: 'room-1',
        description: null,
        createdAt: new Date('2026-01-01'),
        fccCertifications: []
      }
    ]);

    const result = await getServerSideProps({});

    expect(result.redirect).toBeUndefined();
    expect(result.props.user).toBe('teacher-1');
    expect(result.props.classrooms).toHaveLength(1);
    expect(result.props.classrooms[0].classroomId).toBe('room-1');
  });
});
