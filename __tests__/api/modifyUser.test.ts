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
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn()
    }
  }
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import modifyUserHandler from '../../pages/api/modifyuser';
import type { User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const changeBody = {
  id: 'target-1',
  name: 'New Name',
  email: 'target@example.com',
  role: 'TEACHER'
};

const createReq = (
  body: Record<string, unknown> = changeBody,
  method = 'POST'
) => createMockReq({ method, body });

const mockDbUser = (role: string): void => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id: 'admin-1',
    role,
    email: 'admin@example.com'
  } as unknown as User);
};

describe('POST /api/modifyuser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@example.com' }
    });
    mockDbUser('ADMIN');
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
      role: 'STUDENT'
    } as unknown as User);
  });

  it('responds 405 for GET', async () => {
    const res = createMockRes();

    await modifyUserHandler(createReq(changeBody, 'GET'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 403 for a TEACHER', async () => {
    mockDbUser('TEACHER');
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 403 when changing an ADMIN to TEACHER', async () => {
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
      role: 'ADMIN'
    } as unknown as User);
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 200 when an ADMIN changes a STUDENT to TEACHER', async () => {
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'target-1' },
      data: {
        name: 'New Name',
        email: 'target@example.com',
        role: 'TEACHER'
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('responds 401 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 403 when the session user has no database row', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
