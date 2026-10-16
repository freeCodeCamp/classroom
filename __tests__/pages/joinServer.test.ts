vi.mock('next-auth/react', () => ({
  getSession: vi.fn()
}));

vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    classroom: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() }
  }
}));

import { getSession } from 'next-auth/react';
import type { GetServerSidePropsContext } from 'next';
import type { Classroom, User } from '../../generated/prisma/client';
import prisma from '../../prisma/prisma';
import { getServerSideProps } from '../../pages/join/[...joinCode]';

const ctx = {
  params: { joinCode: ['class-1'] }
} as unknown as GetServerSidePropsContext;

describe('join page getServerSideProps', () => {
  beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue({
      user: { email: 'student@example.com', id: 'student-1', role: 'STUDENT' },
      expires: '2099-01-01T00:00:00.000Z'
    });
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomName: 'Class 1',
      description: 'A class',
      classroomId: 'class-1',
      fccUserIds: ['student-1', 'student-2']
    } as unknown as Classroom);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT'
    } as unknown as User);
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
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'student-9',
      role: 'STUDENT'
    } as unknown as User);

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
});
