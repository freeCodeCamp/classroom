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
    user: { findUnique: vi.fn(), update: vi.fn() },
    classroom: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn()
  }
}));

vi.mock('../../util/fcc-api', () => ({
  fetchUserIdByEmail: vi.fn()
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import { fetchUserIdByEmail } from '../../util/fcc-api';
import studentEmailJoinHandler from '../../pages/api/student_email_join';
import type { Classroom, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const createReq = (method = 'PUT') =>
  createMockReq({ method, body: { classroomId: 'class-1' } });

// The handler looks the user up twice: first for auth (id, role, email),
// then for the fCC link (fccProperUserId).
const mockDbUser = (role: string, fccProperUserId: string | null = null) => {
  vi.mocked(prisma.user.findUnique)
    .mockResolvedValueOnce({
      id: 'user-1',
      role,
      email: 'student@example.com'
    } as unknown as User)
    .mockResolvedValueOnce({ fccProperUserId } as unknown as User);
};

describe('PUT /api/student_email_join', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'student@example.com' }
    });
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      fccUserIds: []
    } as unknown as Classroom);
    vi.mocked(fetchUserIdByEmail).mockResolvedValue({ userId: 'fcc-1' });
  });

  it('responds 405 for GET', async () => {
    const res = createMockRes();

    await studentEmailJoinHandler(createReq('GET'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('responds 401 when not signed in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await studentEmailJoinHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('promotes a NONE user to STUDENT and adds them to the class', async () => {
    mockDbUser('NONE');
    const res = createMockRes();

    await studentEmailJoinHandler(createReq(), res);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { fccProperUserId: 'fcc-1', role: 'STUDENT' }
    });
    expect(prisma.classroom.update).toHaveBeenCalledWith({
      where: { classroomId: 'class-1' },
      data: { fccUserIds: { push: 'user-1' } }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, alreadyLinked: false })
    );
  });

  it('keeps the role of a user who is already a STUDENT', async () => {
    mockDbUser('STUDENT', 'fcc-1');
    const res = createMockRes();

    await studentEmailJoinHandler(createReq(), res);

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, alreadyLinked: true })
    );
  });
});
