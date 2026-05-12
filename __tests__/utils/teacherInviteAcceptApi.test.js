import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/teacher_invites/accept';

jest.mock('../../prisma/prisma', () => ({
  TeacherInvitation: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  User: {
    update: jest.fn()
  }
}));

jest.mock('../../util/inviteApiUtils', () => ({
  areEquivalentInviteEmails: jest.fn()
}));

describe('/api/teacher_invites/accept', () => {
  const prisma = require('../../prisma/prisma');
  const inviteApiUtils = require('../../util/inviteApiUtils');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects POST without inviteToken', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('inviteToken');
  });

  it('rejects invalid HTTP methods', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('rejects when invitation not found', async () => {
    prisma.TeacherInvitation.findUnique.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'nonexistent'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('not found');
  });

  it('rejects expired invitations', async () => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    prisma.TeacherInvitation.findUnique.mockResolvedValue({
      id: '1',
      status: 'PENDING',
      expiresAt: expiredDate
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'expired-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invitation expired');
  });

  it('rejects revoked invitations', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    prisma.TeacherInvitation.findUnique.mockResolvedValue({
      id: '1',
      status: 'REVOKED',
      expiresAt: futureDate
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'revoked-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invitation revoked');
  });

  it('rejects already accepted invitations', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    prisma.TeacherInvitation.findUnique.mockResolvedValue({
      id: '1',
      status: 'ACCEPTED',
      expiresAt: futureDate
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'accepted-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('already');
    expect(data.alreadyAccepted).toBe(true);
  });

  it('successfully accepts valid invitation', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    prisma.TeacherInvitation.findUnique.mockResolvedValue({
      id: '1',
      invitedEmail: 'teacher@example.com',
      status: 'PENDING',
      expiresAt: futureDate,
      userId: 'user-123'
    });

    inviteApiUtils.areEquivalentInviteEmails.mockReturnValue(true);

    prisma.TeacherInvitation.update.mockResolvedValue({
      id: '1',
      status: 'ACCEPTED'
    });

    prisma.User.update.mockResolvedValue({
      role: 'TEACHER'
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'valid-token'
      }
    });

    // Mock session
    req.session = {
      user: {
        email: 'teacher@example.com'
      }
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.role).toBe('TEACHER');
  });

  it('rejects invitation with email mismatch', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    prisma.TeacherInvitation.findUnique.mockResolvedValue({
      id: '1',
      invitedEmail: 'teacher@example.com',
      status: 'PENDING',
      expiresAt: futureDate,
      userId: 'user-123'
    });

    inviteApiUtils.areEquivalentInviteEmails.mockReturnValue(false);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        inviteToken: 'valid-token'
      }
    });

    // Mock session with different email
    req.session = {
      user: {
        email: 'different@example.com'
      }
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('email mismatch');
  });
});
