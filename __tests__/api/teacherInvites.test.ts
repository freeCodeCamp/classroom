vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(() => vi.fn()),
  getServerSession: vi.fn()
}));

vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    teacherInvitation: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    user: {
      update: vi.fn()
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops))
  }
}));

vi.mock('../../util/apiAuth', async () => {
  const actual = await vi.importActual('../../util/apiAuth');
  return {
    ...actual,
    requireAuthenticatedUser: vi.fn()
  };
});

vi.mock('../../util/inviteEmail', () => ({
  buildTeacherInviteUrl: vi.fn(
    () => 'https://classroom.test/teacher/invite/new-token'
  ),
  sendTeacherInvitationEmail: vi.fn().mockResolvedValue(undefined)
}));

import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser } from '../../util/apiAuth';
import { sendTeacherInvitationEmail } from '../../util/inviteEmail';
import acceptHandler from '../../pages/api/teacher_invites/accept';
import resendHandler from '../../pages/api/admin/teacher_invites/resend';
import revokeHandler from '../../pages/api/admin/teacher_invites/revoke';
import type { TeacherInvitation, User } from '../../generated/prisma/client';
import { createMockReq, createMockRes } from '../helpers/next-api';

const TEACHER = { id: 'user-1', role: 'NONE', email: 'teacher@example.com' };
const ADMIN = { id: 'admin-1', role: 'ADMIN', email: 'admin@example.com' };

const createReq = (body = {}) => createMockReq({ method: 'POST', body });

const futureDate = () => new Date(Date.now() + 1000 * 60 * 60 * 24);
const pastDate = () => new Date(Date.now() - 1000);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TEACHER_INVITES_ENABLED = 'true';
  vi.mocked(prisma.$transaction).mockImplementation(ops =>
    Promise.all(ops as unknown as Promise<unknown>[])
  );
});

describe('pages/api/teacher_invites/accept', () => {
  it('accepts a PENDING, non-expired invitation and promotes the user to TEACHER', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(TEACHER);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING',
      acceptedById: null,
      expiresAt: futureDate()
    } as unknown as TeacherInvitation);
    vi.mocked(prisma.teacherInvitation.update).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      status: 'ACCEPTED'
    } as unknown as TeacherInvitation);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: TEACHER.id,
      role: 'TEACHER',
      email: TEACHER.email
    } as unknown as User);

    const res = createMockRes();
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
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(TEACHER);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING',
      acceptedById: null,
      expiresAt: pastDate()
    } as unknown as TeacherInvitation);
    vi.mocked(prisma.teacherInvitation.update).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      status: 'EXPIRED'
    } as unknown as TeacherInvitation);

    const res = createMockRes();
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
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(TEACHER);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      acceptedById: TEACHER.id,
      expiresAt: futureDate()
    } as unknown as TeacherInvitation);

    const res = createMockRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ alreadyAccepted: true })
    );
  });

  it('rejects accepting an invitation already ACCEPTED by a different user', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(TEACHER);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      acceptedById: 'someone-else',
      expiresAt: futureDate()
    } as unknown as TeacherInvitation);

    const res = createMockRes();
    await acceptHandler(createReq({ inviteToken: 'token-1' }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it.each(['REVOKED', 'CANCELLED', 'EXPIRED'])(
    'rejects accepting a %s invitation',
    async status => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue(TEACHER);
      vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status,
        acceptedById: null,
        expiresAt: futureDate()
      } as unknown as TeacherInvitation);

      const res = createMockRes();
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
      vi.mocked(requireAuthenticatedUser).mockResolvedValue(currentUser);
      vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
        teacherInvitationId: 'inv-role',
        invitedTeacherEmail: currentUser.email,
        status: 'PENDING',
        acceptedById: null,
        expiresAt: futureDate()
      } as unknown as TeacherInvitation);
      vi.mocked(prisma.teacherInvitation.update).mockResolvedValue({
        teacherInvitationId: 'inv-role',
        status: 'ACCEPTED'
      } as unknown as TeacherInvitation);
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: currentUser.id,
        role: expectedRole,
        email: currentUser.email
      } as unknown as User);

      const res = createMockRes();
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
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(ADMIN);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'ACCEPTED',
      inviteToken: 'old-token',
      expiresAt: futureDate()
    } as unknown as TeacherInvitation);

    const res = createMockRes();
    await resendHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

    expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
    expect(sendTeacherInvitationEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it.each(['PENDING', 'EXPIRED', 'REVOKED'])(
    'resets a %s invitation back to PENDING with a fresh token',
    async status => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue(ADMIN);
      vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status,
        inviteToken: 'old-token',
        expiresAt: pastDate()
      } as unknown as TeacherInvitation);
      vi.mocked(prisma.teacherInvitation.update).mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status: 'PENDING',
        inviteToken: 'new-token',
        expiresAt: futureDate()
      } as unknown as TeacherInvitation);

      const res = createMockRes();
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
    vi.mocked(requireAuthenticatedUser).mockResolvedValue(ADMIN);
    vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'PENDING'
    } as unknown as TeacherInvitation);
    vi.mocked(prisma.teacherInvitation.update).mockResolvedValue({
      teacherInvitationId: 'inv-1',
      invitedTeacherEmail: TEACHER.email,
      status: 'REVOKED'
    } as unknown as TeacherInvitation);

    const res = createMockRes();
    await revokeHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

    expect(prisma.teacherInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REVOKED' } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each(['ACCEPTED', 'EXPIRED', 'REVOKED', 'CANCELLED'])(
    'refuses to revoke a %s invitation',
    async status => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue(ADMIN);
      vi.mocked(prisma.teacherInvitation.findUnique).mockResolvedValue({
        teacherInvitationId: 'inv-1',
        invitedTeacherEmail: TEACHER.email,
        status
      } as unknown as TeacherInvitation);

      const res = createMockRes();
      await revokeHandler(createReq({ teacherInvitationId: 'inv-1' }), res);

      expect(prisma.teacherInvitation.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
    }
  );
});
