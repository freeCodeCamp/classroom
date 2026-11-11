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
import removeStudentHandler from '../../pages/api/remove_student';
import type { Classroom, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const validBody = { classroomId: 'class-1', studentEmail: 'kid@example.com' };

const createReq = (body: unknown = validBody, method = 'DELETE') =>
  createMockReq({ method, body });

// The handler looks users up twice: the teacher (auth), then the student.
const mockUsers = (
  teacher: Partial<User> | null,
  student: Partial<User> | null = { id: 'student-1' }
) => {
  vi.mocked(prisma.user.findUnique)
    .mockResolvedValueOnce(teacher as User | null)
    .mockResolvedValueOnce(student as User | null);
};

const teacher = { id: 'teacher-1', role: 'TEACHER', email: 't@example.com' };

describe('DELETE /api/remove_student', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 't@example.com' }
    });
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-1'
    } as unknown as Classroom);
    vi.mocked(prisma.$executeRaw).mockResolvedValue(1 as never);
  });

  it('responds 405 for POST', async () => {
    const res = createMockRes();

    await removeStudentHandler(createReq(validBody, 'POST'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it.each([
    ['no body', null],
    ['a missing email', { classroomId: 'class-1' }],
    ['a blank email', { classroomId: 'class-1', studentEmail: '  ' }],
    ['a non-string class', { classroomId: 7, studentEmail: 'a@b.c' }]
  ])('responds 400 for %s', async (_label, body) => {
    const res = createMockRes();

    await removeStudentHandler(createReq(body), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('responds 401 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('responds 403 for a student', async () => {
    mockUsers({ ...teacher, role: 'STUDENT' });
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it("responds 403 for another teacher's class", async () => {
    mockUsers(teacher);
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-2'
    } as unknown as Classroom);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('responds 404 for an unknown class', async () => {
    mockUsers(teacher);
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue(null);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('responds 404 for an unknown student', async () => {
    mockUsers(teacher, null);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('responds 404 when the student is not in the class', async () => {
    mockUsers(teacher);
    vi.mocked(prisma.$executeRaw).mockResolvedValue(0 as never);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('removes the student from the roster', async () => {
    mockUsers(teacher);
    const res = createMockRes();

    await removeStudentHandler(createReq(), res);

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    const [sql, ...values] = vi.mocked(prisma.$executeRaw).mock.calls[0];
    expect((sql as TemplateStringsArray).join('?')).toContain('array_remove');
    expect(values).toEqual(['student-1', 'class-1', 'teacher-1', 'student-1']);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
