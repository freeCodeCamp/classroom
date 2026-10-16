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
    user: {
      findUnique: vi.fn()
    },
    classroom: {
      findUniqueOrThrow: vi.fn(),
      delete: vi.fn()
    }
  }
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import deleteClassHandler from '../../pages/api/deleteclass';
import type { Classroom, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const createReq = (method = 'DELETE') =>
  createMockReq({ method, body: 'class-1' });

const mockDbUser = (role: string, id: string): void => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id,
    role,
    email: 'user@example.com'
  } as unknown as User);
};

describe('DELETE /api/deleteclass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'user@example.com' }
    });
    mockDbUser('TEACHER', 'teacher-1');
    vi.mocked(prisma.classroom.findUniqueOrThrow).mockResolvedValue({
      classroomId: 'class-1',
      classroomTeacherId: 'teacher-1'
    } as unknown as Classroom);
  });

  it('responds 405 for POST', async () => {
    const res = createMockRes();

    await deleteClassHandler(createReq('POST'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });

  it('responds 403 when the session user has no database row', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });

  it("responds 403 when a TEACHER deletes another teacher's class", async () => {
    vi.mocked(prisma.classroom.findUniqueOrThrow).mockResolvedValue({
      classroomId: 'class-1',
      classroomTeacherId: 'someone-else'
    } as unknown as Classroom);
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });

  it("deletes the TEACHER's own class", async () => {
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(prisma.classroom.delete).toHaveBeenCalledWith({
      where: { classroomId: 'class-1' }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('responds 403 for an ADMIN', async () => {
    mockDbUser('ADMIN', 'teacher-1');
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });

  it('responds 403 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });

  it('responds 403 for a STUDENT', async () => {
    mockDbUser('STUDENT', 'teacher-1');
    const res = createMockRes();

    await deleteClassHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.delete).not.toHaveBeenCalled();
  });
});
