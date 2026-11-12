vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(() => vi.fn()),
  getServerSession: vi.fn()
}));

vi.mock('../../pages/api/auth/[...nextauth]', () => ({
  authOptions: {}
}));

vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: vi.fn() },
    classroom: { findUnique: vi.fn() },
    $executeRaw: vi.fn()
  }
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import joinRequestHandler from '../../pages/api/join_request';
import type { Classroom, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const body = (decision: unknown) => ({
  classroomId: 'class-1',
  userId: 'student-1',
  decision
});

const createReq = (requestBody: unknown, method = 'PUT') =>
  createMockReq({ method, body: requestBody });

const sqlOf = (): string =>
  (vi.mocked(prisma.$executeRaw).mock.calls[0][0] as TemplateStringsArray).join(
    '?'
  );

describe('PUT /api/join_request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 't@example.com' }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'teacher-1',
      role: 'TEACHER',
      email: 't@example.com'
    } as unknown as User);
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-1'
    } as unknown as Classroom);
    vi.mocked(prisma.$executeRaw).mockResolvedValue(1 as never);
  });

  it('responds 405 for DELETE', async () => {
    const res = createMockRes();

    await joinRequestHandler(createReq(body('approve'), 'DELETE'), res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it.each([
    ['an unknown decision', body('maybe')],
    ['a missing user', { classroomId: 'class-1', decision: 'approve' }],
    ['no body', undefined]
  ])('responds 400 for %s', async (_label, requestBody) => {
    const res = createMockRes();

    await joinRequestHandler(createReq(requestBody), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it("responds 403 for another teacher's class", async () => {
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-2'
    } as unknown as Classroom);
    const res = createMockRes();

    await joinRequestHandler(createReq(body('approve')), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('approves by moving the student to the roster', async () => {
    const res = createMockRes();

    await joinRequestHandler(createReq(body('approve')), res);

    expect(sqlOf()).toContain('array_append("fccUserIds"');
    expect(sqlOf()).toContain('array_remove("pendingUserIds"');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('declines by clearing only the request', async () => {
    const res = createMockRes();

    await joinRequestHandler(createReq(body('decline')), res);

    expect(sqlOf()).toContain('array_remove("pendingUserIds"');
    expect(sqlOf()).not.toContain('fccUserIds');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('responds 404 when the request was already handled', async () => {
    vi.mocked(prisma.$executeRaw).mockResolvedValue(0 as never);
    const res = createMockRes();

    await joinRequestHandler(createReq(body('approve')), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
