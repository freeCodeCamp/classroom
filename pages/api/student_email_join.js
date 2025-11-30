// pages/api/student_email_join.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  console.log('student_email_join: incoming method', req.method);
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getServerAuthSession(req, res);
    console.log(
      'student_email_join: session user:',
      session?.user?.email,
      session?.user?.id,
      session?.user?.role
    );

    if (!session || !session.user) {
      console.log('student_email_join: no session -> 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const role = String(session.user.role || '').toLowerCase();
    if (role !== 'teacher' && role !== 'admin') {
      console.log('student_email_join: wrong role:', role);
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { classroomId, email } = req.body || {};
    console.log('student_email_join: payload:', { classroomId, email });

    if (!classroomId) {
      console.log('student_email_join: missing classroomId');
      return res.status(400).json({ error: 'Missing classroomId' });
    }

    const classRow = await prisma.classroom.findUnique({
      where: { classroomId }
    });
    if (!classRow) {
      console.log('student_email_join: class not found:', classroomId);
      return res.status(404).json({ error: 'Class not found' });
    }

    if (
      role === 'teacher' &&
      String(classRow.classroomTeacherId) !== String(session.user.id)
    ) {
      console.log('student_email_join: teacher does not own class', {
        owner: classRow.classroomTeacherId,
        user: session.user.id
      });
      return res
        .status(403)
        .json({ error: "Cannot invite to class you don't own" });
    }

    // Build join link (absolute)
    const base =
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
      `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const joinLink = `${base}/join?classroomId=${encodeURIComponent(
      classRow.classroomId
    )}`;

    // Optionally: if you want to create an Invite DB row (skip if no model)
    try {
      const invite = await prisma.invite.create({
        data: {
          classroomId: classRow.classroomId,
          email: email || null,
          invitedById: String(session.user.id)
        }
      });
      console.log('student_email_join: created invite row id:', invite.id);
      return res
        .status(201)
        .json({ message: 'Invite created', joinLink, inviteId: invite.id });
    } catch (inviteErr) {
      // If Invite model doesn't exist, just return the link
      console.log(
        'student_email_join: no invite model or create failed, returning link',
        inviteErr?.message || inviteErr
      );
      return res
        .status(200)
        .json({ message: 'Invite link created (no DB invite)', joinLink });
    }
  } catch (err) {
    console.error('student_email_join: unexpected error:', err);
    return res.status(500).json({ error: 'Server error during invite' });
  }
}
