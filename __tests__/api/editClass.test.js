// next-auth's main entry transitively pulls in openid-client/jose
// (ESM-only), which Jest's default transform can't parse. Stub it out.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
  unstable_getServerSession: jest.fn()
}));

jest.mock('../../pages/api/auth/[...nextauth]', () => ({
  authOptions: {}
}));

jest.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUniqueOrThrow: jest.fn()
    },
    classroom: {
      update: jest.fn()
    }
  }
}));

import { unstable_getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import editClassHandler from '../../pages/api/editclass';

const createReq = body => ({ method: 'PUT', body });

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

describe('PUT /api/editclass', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unstable_getServerSession.mockResolvedValue({
      user: { email: 'teacher@example.com' }
    });
    prisma.user.findUniqueOrThrow.mockResolvedValue({ role: 'TEACHER' });
    prisma.classroom.update.mockImplementation(({ where, data }) =>
      Promise.resolve({ classroomId: where.classroomId, ...data })
    );
  });

  // Regression test: an empty list used to be turned into "no change", so a
  // class could be created without certifications but never edited to have none.
  it('saves an empty certification list when every certification is removed', async () => {
    const res = createRes();

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
    const res = createRes();

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
    const res = createRes();

    await editClassHandler(createReq({ classroomId: 'class-1' }), res);

    expect(res.status).toHaveBeenCalledWith(304);
    expect(prisma.classroom.update).not.toHaveBeenCalled();
  });
});
