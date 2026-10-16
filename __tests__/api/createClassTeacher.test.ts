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
      create: vi.fn()
    }
  }
}));

import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import createClassTeacherHandler from '../../pages/api/create_class_teacher';
import type { User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const classBody = {
  classroomName: 'Class',
  description: 'About',
  classroomTeacherId: 'teacher-1',
  fccCertifications: ['responsive-web-design']
};

const createReq = (
  body: Record<string, unknown> = classBody,
  method = 'POST'
) => createMockReq({ method, body });

const mockDbUser = (role: string, id = 'teacher-1'): void => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id,
    role,
    email: 'user@example.com'
  } as unknown as User);
};

describe('POST /api/create_class_teacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'user@example.com' }
    });
    mockDbUser('TEACHER');
    vi.mocked(prisma.classroom.create).mockImplementation(
      ({ data }) =>
        Promise.resolve({
          classroomId: 'class-1',
          ...data
        }) as unknown as ReturnType<typeof prisma.classroom.create>
    );
  });

  it('responds 405 for GET', async () => {
    const res = createMockRes();

    await createClassTeacherHandler(createReq(classBody, 'GET'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it('responds 403 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it('responds 403 for a STUDENT', async () => {
    mockDbUser('STUDENT');
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it("responds 403 when a TEACHER sends another teacher's id", async () => {
    const res = createMockRes();

    await createClassTeacherHandler(
      createReq({ ...classBody, classroomTeacherId: 'someone-else' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it('creates a class for a TEACHER on their own behalf', async () => {
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(prisma.classroom.create).toHaveBeenCalledWith({
      data: {
        classroomName: 'Class',
        description: 'About',
        classroomTeacherId: 'teacher-1',
        fccCertifications: ['responsive-web-design']
      }
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ classroomId: 'class-1' })
    );
  });

  it('responds 403 when the session user has no database row', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it('responds 403 for an ADMIN', async () => {
    mockDbUser('ADMIN', 'teacher-1');
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });
});
