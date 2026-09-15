// next-auth's main entry transitively pulls in openid-client/jose
// (ESM-only), which Jest's default transform can't parse. Stub it out
// before util/inviteApiUtils (imported for real below) loads it.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
  getServerSession: jest.fn()
}));

jest.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    teacherInvitation: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    user: {
      update: jest.fn()
    },
    $transaction: jest.fn(ops => Promise.all(ops))
  }
}));

jest.mock('../../util/inviteApiUtils', () => {
  const actual = jest.requireActual('../../util/inviteApiUtils');
  return {
    ...actual,
    requireAuthenticatedUser: jest.fn()
  };
});

jest.mock('../../util/inviteEmail', () => ({
  buildTeacherInviteUrl: jest.fn(
    () => 'https://classroom.test/teacher/invite/new-token'
  ),
  sendTeacherInvitationEmail: jest.fn().mockResolvedValue(undefined)
}));

import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser } from '../../util/inviteApiUtils';
import { sendTeacherInvitationEmail } from '../../util/inviteEmail';
import acceptHandler from '../../pages/api/teacher_invites/accept';
import resendHandler from '../../pages/api/admin/teacher_invites/resend';
import revokeHandler from '../../pages/api/admin/teacher_invites/revoke';

const TEACHER = { id: 'user-1', role: 'NONE', email: 'teacher@example.com' };
const ADMIN = { id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' };

const createReq = (body = {}) => ({ method: 'POST', body });

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const futureDate = () => new Date(Date.now() + 1000 * 60 * 60 * 24);
const pastDate = () => new Date(Date.now() - 1000);

beforeEach(() => {
  jest.clearAllMocks();
  process.env.TEACHER_INVITES_ENABLED = 'true';
  prisma.$transaction.mockImplementation(ops => Promise.all(ops));
});

describe('pages/api/teacher_invites/accept', () => {
  it('accepts a PENDING, non-expired invitation and promotes the user to TEACHER', async () => {
    requireAuthenticatedUser.mockResolvedValue(TEACHER);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING',
      acceptedById: null,
      expiresAt: futureDate()
    });
    prisma.teacherInvitation.update.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      status: 'ACCEPTED'
    });
    prisma.user.update.mockResolvedValue({
      id: TEACHER.id,
      role: 'TEACHER',
      email: TEACHER.email
    });

    const res = createRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(prisma.teacherInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'ACCEPTED', acceptedById: TEACHER.id }
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'TEACHER' } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ alreadyAccepted: false })
    );
  });

  it('flips an expired PENDING invitation to EXPIRED and returns 410', async () => {
    requireAuthenticatedUser.mockResolvedValue(TEACHER);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING',
      acceptedById: null,
      expiresAt: pastDate()
    });
    prisma.teacherInvitation.update.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      status: 'EXPIRED'
    });

    const res = createRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(prisma.teacherInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'EXPIRED' } })
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'EXPIRED' })
    );
  });

  it('treats re-accepting an already-ACCEPTED invitation by the same user as idempotent', async () => {
    requireAuthenticatedUser.mockResolvedValue(TEACHER);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      acceptedById: TEACHER.id,
      expiresAt: futureDate()
    });

    const res = createRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ alreadyAccepted: true })
    );
  });

  it('rejects accepting an invitation already ACCEPTED by a different user', async () => {
    requireAuthenticatedUser.mockResolvedValue(TEACHER);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      acceptedById: 'someone-else',
      expiresAt: futureDate()
    });

    const res = createRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it.each(['REVOKED', 'CANCELLED', 'EXPIRED'])(
    'rejects accepting a %s invitation',
    async status => {
      requireAuthenticatedUser.mockResolvedValue(TEACHER);
      prisma.teacherInvitation.findUnique.mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status,
        acceptedById: null,
        expiresAt: futureDate()
      });

      const res = createRes();
      await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

      expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Only pending invitations can be accepted',
          status
        })
      );
    }
  );

  // Documents current behavior: accept.js only special-cases ADMIN
  // (`currentUser.role === 'ADMIN' ? 'ADMIN' : 'TEACHER'`). Every other
  // existing role, including STUDENT, is unconditionally overwritten to
  // TEACHER on acceptance — there is no multi-role support (`role` is a
  // single string field) and no guard/audit trail for a STUDENT losing
  // that designation. This is accepted as intentional: classroom
  // membership as a student is just a roster entry, not a protected role,
  // so promoting that account to TEACHER has no destructive side effect
  // worth guarding against.
  it.each([
    { currentRole: 'ADMIN', expectedRole: 'ADMIN' },
    { currentRole: 'TEACHER', expectedRole: 'TEACHER' },
    { currentRole: 'STUDENT', expectedRole: 'TEACHER' },
    { currentRole: 'NONE', expectedRole: 'TEACHER' }
  ])(
    'a $currentRole accepting a valid invite ends up as $expectedRole',
    async ({ currentRole, expectedRole }) => {
      const currentUser = {
        id: 'user-role-test',
        role: currentRole,
        email: 'invitee@example.com'
      };
      requireAuthenticatedUser.mockResolvedValue(currentUser);
      prisma.teacherInvitation.findUnique.mockResolvedValue({
        teacherInvitationId: 'inv-role',
        invitedTeacherEmail: currentUser.email,
        status: 'PENDING',
        acceptedById: null,
        expiresAt: futureDate()
      });
      prisma.teacherInvitation.update.mockResolvedValue({
        teacherInvitationId: 'inv-role',
        status: 'ACCEPTED'
      });
      prisma.user.update.mockResolvedValue({
        id: currentUser.id,
        role: expectedRole,
        email: currentUser.email
      });

      const res = createRes();
      await acceptHandler(createReq({ inviteToken: 'token-role' }), res);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: expectedRole } })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    }
  );
});

describe('pages/api/admin/teacher_invites/resend', () => {
  it('refuses to resend an ACCEPTED invitation', async () => {
    requireAuthenticatedUser.mockResolvedValue(ADMIN);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      inviteToken: 'old-token',
      expiresAt: futureDate()
    });

    const res = createRes();
    await resendHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

    expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
    expect(sendTeacherInvitationEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it.each(['PENDING', 'EXPIRED', 'REVOKED'])(
    'resets a %s invitation back to PENDING with a fresh token',
    async status => {
      requireAuthenticatedUser.mockResolvedValue(ADMIN);
      prisma.teacherInvitation.findUnique.mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status,
        inviteToken: 'old-token',
        expiresAt: pastDate()
      });
      prisma.teacherInvitation.update.mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status: 'PENDING',
        inviteToken: 'new-token',
        expiresAt: futureDate()
      });

      const res = createRes();
      await resendHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

      expect(prisma.teacherInvitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' })
        })
      );
      expect(sendTeacherInvitationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    }
  );
});

describe('pages/api/admin/teacher_invites/revoke', () => {
  it('revokes a PENDING invitation', async () => {
    requireAuthenticatedUser.mockResolvedValue(ADMIN);
    prisma.teacherInvitation.findUnique.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING'
    });
    prisma.teacherInvitation.update.mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'REVOKED'
    });

    const res = createRes();
    await revokeHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

    expect(prisma.teacherInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REVOKED' } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each(['ACCEPTED', 'EXPIRED', 'REVOKED', 'CANCELLED'])(
    'refuses to revoke a %s invitation',
    async status => {
      requireAuthenticatedUser.mockResolvedValue(ADMIN);
      prisma.teacherInvitation.findUnique.mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status
      });

      const res = createRes();
      await revokeHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

      expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
    }
  );
});
