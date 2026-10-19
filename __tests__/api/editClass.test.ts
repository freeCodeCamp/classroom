// next-auth's main entry transitively pulls in openid-client/jose
// (ESM-only), which Jest's default transform can't parse. Stub it out.
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
      update: vi.fn()
    }
  }
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import editClassHandler from '../../pages/api/editclass';
import type { Classroom, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const createReq = (body: Record<string, unknown>) =>
  createMockReq({ method: 'PUT', body });

describe('PUT /api/editclass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'teacher@example.com' }
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'teacher-1',
      role: 'TEACHER',
      email: 'teacher@example.com'
    } as unknown as User);
    vi.mocked(prisma.classroom.findUniqueOrThrow).mockResolvedValue({
      classroomTeacherId: 'teacher-1'
    } as unknown as Classroom);
    vi.mocked(prisma.classroom.update).mockImplementation(
      ({ where, data }) =>
        Promise.resolve({
          classroomId: where.classroomId,
          ...data
        }) as unknown as ReturnType<typeof prisma.classroom.update>
    );
  });

  // Regression test: an empty list used to be turned into "no change", so a
  // class could be created without certifications but never edited to have none.
  it('saves an empty certification list when every certification is removed', async () => {
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', fccCertifications: [] }),
      res
    );

    expect(prisma.classroom.update).toHaveBeenCalledWith({
      where: { classroomId: 'class-1' },
      data: {
        classroomName: undefined,
        description: undefined,
        fccCertifications: []
      }
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ fccCertifications: [] })
    );
  });

  it('saves a new name sent as classroomName', async () => {
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', classroomName: 'Renamed' }),
      res
    );

    expect(prisma.classroom.update).toHaveBeenCalledWith({
      where: { classroomId: 'class-1' },
      data: {
        classroomName: 'Renamed',
        description: undefined,
        fccCertifications: undefined
      }
    });
  });

  it('responds 304 without updating when no fields are sent', async () => {
    const res = createMockRes();

    await editClassHandler(createReq({ classroomId: 'class-1' }), res);

    expect(res.status).toHaveBeenCalledWith(304);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  // Regression test: any teacher could edit any class by sending its id,
  // because only the role was checked, never who owns the class.
  it("rejects edits to another teacher's class", async () => {
    vi.mocked(prisma.classroom.findUniqueOrThrow).mockResolvedValue({
      classroomTeacherId: 'someone-else'
    } as unknown as Classroom);
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', classroomName: 'Renamed' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  it('responds 400 when the class does not exist', async () => {
    vi.mocked(prisma.classroom.findUniqueOrThrow).mockRejectedValue(
      new Error('missing')
    );
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'nope', classroomName: 'Renamed' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  it('responds 401 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', classroomName: 'Renamed' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  it('responds 403 when the session user has no database row', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', classroomName: 'Renamed' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  it('responds 403 for an admin, since only teachers may edit', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
      email: 'admin@example.com'
    } as unknown as User);
    const res = createMockRes();

    await editClassHandler(
      createReq({ classroomId: 'class-1', classroomName: 'Renamed' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });

  it('rejects methods other than PUT', async () => {
    const res = createMockRes();

    await editClassHandler(
      createMockReq({ method: 'GET', body: { classroomId: 'class-1' } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });
});
