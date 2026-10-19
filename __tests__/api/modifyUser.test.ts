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

// findUnique is called twice: by email for the signed-in user, then by id
// for the user being changed.
let sessionUserRole: string | null = 'ADMIN';
let targetUserRole: string | null = 'STUDENT';

const mockDbUser = (role: string | null): void => {
  sessionUserRole = role;
};

const mockTargetUser = (role: string | null): void => {
  targetUserRole = role;
};

describe('POST /api/modifyuser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@example.com' }
    });
    mockDbUser('ADMIN');
    mockTargetUser('STUDENT');
    vi.mocked(prisma.user.findUnique).mockImplementation((async ({
      where
    }: {
      where: { email?: string; id?: string };
    }) => {
      if (where.email !== undefined) {
        return sessionUserRole === null
          ? null
          : {
              id: 'admin-1',
              role: sessionUserRole,
              email: 'admin@example.com'
            };
      }
      return targetUserRole === null ? null : { role: targetUserRole };
    }) as unknown as typeof prisma.user.findUnique);
    vi.mocked(prisma.user.update).mockResolvedValue({} as User);
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
    mockTargetUser('ADMIN');
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
    mockDbUser(null);
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 400 for a role that does not exist', async () => {
    const res = createMockRes();

    await modifyUserHandler(
      createReq({ ...changeBody, role: 'SUPERUSER' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 400 when the user id is missing', async () => {
    const res = createMockRes();

    await modifyUserHandler(createReq({ ...changeBody, id: undefined }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('changes only the fields that were sent', async () => {
    const res = createMockRes();

    await modifyUserHandler(
      createReq({ id: 'target-1', role: 'TEACHER' }),
      res
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'target-1' },
      data: { name: undefined, email: undefined, role: 'TEACHER' }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('leaves empty fields unchanged', async () => {
    const res = createMockRes();

    await modifyUserHandler(
      createReq({ id: 'target-1', name: '', email: '', role: 'TEACHER' }),
      res
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'target-1' },
      data: { name: undefined, email: undefined, role: 'TEACHER' }
    });
  });

  it('responds 404 when the user to change does not exist', async () => {
    mockTargetUser(null);
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('responds 409 when the new email belongs to another user', async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002' })
    );
    const res = createMockRes();

    await modifyUserHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('rethrows other database errors', async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('db down'));
    const res = createMockRes();

    await expect(modifyUserHandler(createReq(), res)).rejects.toThrow(
      'db down'
    );
  });
});
