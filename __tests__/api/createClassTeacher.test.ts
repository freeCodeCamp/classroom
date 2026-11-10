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

  it.each([
    { classroomName: 'n'.repeat(101) },
    { description: 'd'.repeat(501) },
    { classroomName: '' },
    { classroomName: '   ' },
    { classroomName: '\n\t ' },
    { classroomName: undefined },
    { classroomName: null },
    { classroomName: 42 },
    { description: ['About'] },
    { description: { length: 10 } }
  ])('rejects invalid classroom fields: %j', async fields => {
    const res = createMockRes();

    await createClassTeacherHandler(
      createReq({ ...classBody, ...fields }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(prisma.classroom.create).not.toHaveBeenCalled();
  });

  it.each([null, undefined, 'text', []])(
    'rejects a non-object body: %j',
    async body => {
      const res = createMockRes();

      await createClassTeacherHandler(
        createMockReq({ method: 'POST', body }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.classroom.create).not.toHaveBeenCalled();
    }
  );

  it('accepts text at both limits without truncating it', async () => {
    const body = {
      ...classBody,
      classroomName: 'n'.repeat(100),
      description: 'd'.repeat(500)
    };
    const res = createMockRes();

    await createClassTeacherHandler(createReq(body), res);

    expect(prisma.classroom.create).toHaveBeenCalledWith({ data: body });
  });

  it('saves the name and description without leading or trailing whitespace', async () => {
    const res = createMockRes();

    await createClassTeacherHandler(
      createReq({
        ...classBody,
        classroomName: '  Period  3 ',
        description: '\n  Line one\n\nLine two  \n'
      }),
      res
    );

    expect(prisma.classroom.create).toHaveBeenCalledWith({
      data: {
        ...classBody,
        classroomName: 'Period  3',
        description: 'Line one\n\nLine two'
      }
    });
  });

  it('applies the limits after trimming', async () => {
    const res = createMockRes();

    await createClassTeacherHandler(
      createReq({
        ...classBody,
        classroomName: ` ${'n'.repeat(100)} `,
        description: `a${' '.repeat(600)}`
      }),
      res
    );

    expect(prisma.classroom.create).toHaveBeenCalledWith({
      data: { ...classBody, classroomName: 'n'.repeat(100), description: 'a' }
    });
  });

  it('saves a whitespace-only description as empty', async () => {
    const res = createMockRes();

    await createClassTeacherHandler(
      createReq({ ...classBody, description: '   ' }),
      res
    );

    expect(prisma.classroom.create).toHaveBeenCalledWith({
      data: { ...classBody, description: '' }
    });
  });

  it.each([undefined, null, ''])(
    'preserves an optional description: %j',
    async description => {
      const res = createMockRes();

      await createClassTeacherHandler(
        createReq({ ...classBody, description }),
        res
      );

      expect(prisma.classroom.create).toHaveBeenCalledWith({
        data: { ...classBody, description }
      });
    }
  );

  it('responds 401 when signed out', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = createMockRes();

    await createClassTeacherHandler(createReq(), res);

    expect(res.status).toHaveBeenCalledWith(401);
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

  // The teacher id is checked before the text, so invalid text can't turn a
  // forbidden create into a 400.
  it.each([
    { classroomName: 'n'.repeat(101) },
    { classroomName: '   ' },
    { description: 'd'.repeat(501) }
  ])(
    "responds 403, not 400, for invalid text with another teacher's id: %j",
    async fields => {
      const res = createMockRes();

      await createClassTeacherHandler(
        createReq({
          ...classBody,
          ...fields,
          classroomTeacherId: 'someone-else'
        }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(prisma.classroom.create).not.toHaveBeenCalled();
    }
  );

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
