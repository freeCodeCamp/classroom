import { createMocks } from 'node-mocks-http';
import createHandler from '../../pages/api/admin/teacher_invites/create';
import acceptHandler from '../../pages/api/teacher_invites/accept';

jest.mock('../../prisma/prisma', () => ({
  TeacherInvitation: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  User: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
}));

jest.mock('../../util/inviteEmail', () => ({
  sendTeacherInvitationEmail: jest.fn()
}));

jest.mock('../../util/inviteApiUtils', () => ({
  areEquivalentInviteEmails: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  getSession: jest.fn()
}));

describe('Admin to Teacher Onboarding Flow', () => {
  const prisma = require('../../prisma/prisma');
  const inviteEmail = require('../../util/inviteEmail');
  const inviteApiUtils = require('../../util/inviteApiUtils');
  const nextAuth = require('next-auth/react');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full flow: create invite -> accept invite -> role transition', async () => {
    const teacherEmail = 'teacher@example.com';
    const adminEmail = 'admin@example.com';
    const inviteToken = 'test-token-123';

    // Mock admin session
    nextAuth.getSession.mockResolvedValue({
      user: {
        email: adminEmail
      }
    });

    // 1. Admin creates invitation
    prisma.TeacherInvitation.findUnique.mockResolvedValueOnce(null); // No existing pending invite
    prisma.TeacherInvitation.create.mockResolvedValueOnce({
      id: 'invite-1',
      token: inviteToken,
      invitedEmail: teacherEmail,
      status: 'PENDING',
      createdAt: new Date()
    });

    inviteEmail.sendTeacherInvitationEmail.mockResolvedValueOnce({
      success: true,
      messageId: 'msg-123'
    });

    const { req: createReq, res: createRes } = createMocks({
      method: 'POST',
      body: {
        email: teacherEmail,
        adminName: 'Test Admin'
      }
    });

    createReq.session = nextAuth.getSession();

    await createHandler(createReq, createRes);

    expect(createRes._getStatusCode()).toBe(201);
    const createData = JSON.parse(createRes._getData());
    expect(createData.success).toBe(true);
    expect(createData.invitation.invitedEmail).toBe(teacherEmail);

    // 2. Teacher accepts invitation
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    prisma.TeacherInvitation.findUnique.mockResolvedValueOnce({
      id: 'invite-1',
      token: inviteToken,
      invitedEmail: teacherEmail,
      status: 'PENDING',
      expiresAt: futureDate,
      userId: 'user-123'
    });

    inviteApiUtils.areEquivalentInviteEmails.mockReturnValueOnce(true);

    prisma.TeacherInvitation.update.mockResolvedValueOnce({
      id: 'invite-1',
      status: 'ACCEPTED'
    });

    prisma.User.update.mockResolvedValueOnce({
      id: 'user-123',
      email: teacherEmail,
      role: 'TEACHER'
    });

    const { req: acceptReq, res: acceptRes } = createMocks({
      method: 'POST',
      body: {
        inviteToken: inviteToken
      }
    });

    acceptReq.session = {
      user: {
        email: teacherEmail
      }
    };

    await acceptHandler(acceptReq, acceptRes);

    expect(acceptRes._getStatusCode()).toBe(200);
    const acceptData = JSON.parse(acceptRes._getData());
    expect(acceptData.success).toBe(true);
    expect(acceptData.role).toBe('TEACHER');

    // 3. Verify retry after acceptance returns already accepted
    prisma.TeacherInvitation.findUnique.mockResolvedValueOnce({
      id: 'invite-1',
      status: 'ACCEPTED',
      expiresAt: futureDate
    });

    const { req: retryReq, res: retryRes } = createMocks({
      method: 'POST',
      body: {
        inviteToken: inviteToken
      }
    });

    retryReq.session = {
      user: {
        email: teacherEmail
      }
    };

    await acceptHandler(retryReq, retryRes);

    expect(retryRes._getStatusCode()).toBe(400);
    const retryData = JSON.parse(retryRes._getData());
    expect(retryData.alreadyAccepted).toBe(true);
  });

  it('rolls back invitation creation on email send failure', async () => {
    const teacherEmail = 'teacher@example.com';
    const adminEmail = 'admin@example.com';
    const inviteToken = 'test-token-456';

    nextAuth.getSession.mockResolvedValue({
      user: {
        email: adminEmail
      }
    });

    // No existing pending invite
    prisma.TeacherInvitation.findUnique.mockResolvedValueOnce(null);

    // Create invite
    prisma.TeacherInvitation.create.mockResolvedValueOnce({
      id: 'invite-2',
      token: inviteToken,
      invitedEmail: teacherEmail,
      status: 'PENDING'
    });

    // Email send fails
    inviteEmail.sendTeacherInvitationEmail.mockResolvedValueOnce({
      success: false,
      error: 'SMTP configuration missing'
    });

    // Delete the created invite on failure
    prisma.TeacherInvitation.delete.mockResolvedValueOnce({
      id: 'invite-2'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: teacherEmail,
        adminName: 'Test Admin'
      }
    });

    req.session = nextAuth.getSession();

    await createHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('SMTP');

    // Verify deletion was called to roll back
    expect(prisma.TeacherInvitation.delete).toHaveBeenCalled();
  });
});
