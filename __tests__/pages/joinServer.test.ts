vi.mock('../../util/pageAuth', () => ({ getSessionUser: vi.fn() }));

vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    classroom: { findUnique: vi.fn() }
  }
}));

import { getSessionUser } from '../../util/pageAuth';
import type { GetServerSidePropsContext } from 'next';
import type { Classroom } from '../../generated/prisma/client';
import prisma from '../../prisma/prisma';
import { getServerSideProps } from '../../pages/join/[...joinCode]';

const ctx = {
  params: { joinCode: ['class-1'] }
} as unknown as GetServerSidePropsContext;

describe('join page getServerSideProps', () => {
  beforeEach(() => {
    vi.mocked(getSessionUser).mockResolvedValue({
      session: {
        user: {
          email: 'student@example.com',
          id: 'student-1',
          role: 'STUDENT'
        },
        expires: '2099-01-01T00:00:00.000Z'
      },
      user: { id: 'student-1', email: 'student@example.com', role: 'STUDENT' }
    });
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomName: 'Class 1',
      description: 'A class',
      classroomId: 'class-1',
      fccUserIds: ['student-1', 'student-2']
    } as unknown as Classroom);
  });

  it('does not send the class roster to the browser', async () => {
    const result = await getServerSideProps(ctx);

    expect(result).toEqual({
      props: {
        userSession: {
          user: {
            email: 'student@example.com',
            id: 'student-1',
            role: 'STUDENT'
          },
          expires: '2099-01-01T00:00:00.000Z'
        },
        classroom: {
          classroomName: 'Class 1',
          description: 'A class',
          classroomId: 'class-1'
        },
        userIsConnected: true,
        userRole: 'STUDENT'
      }
    });
    expect(JSON.stringify(result)).not.toContain('student-2');
  });

  it('marks a user outside the roster as not connected', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      session: {
        user: { email: 'other@example.com', id: 'student-9', role: 'STUDENT' },
        expires: '2099-01-01T00:00:00.000Z'
      },
      user: { id: 'student-9', email: 'other@example.com', role: 'STUDENT' }
    });

    const result = await getServerSideProps(ctx);

    expect(result).toMatchObject({ props: { userIsConnected: false } });
  });

  it('returns no classroom for an unknown join code', async () => {
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue(null);

    const result = await getServerSideProps(ctx);

    expect(result).toMatchObject({
      props: { classroom: null, userIsConnected: false }
    });
  });

  it('shows the page to a signed-out user without redirecting', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const result = await getServerSideProps(ctx);

    expect(result).toEqual({
      props: {
        userSession: null,
        classroom: {
          classroomName: 'Class 1',
          description: 'A class',
          classroomId: 'class-1'
        },
        userIsConnected: false,
        userRole: null
      }
    });
  });
});
