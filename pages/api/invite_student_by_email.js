// pages/api/invite_student_by_email.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerAuthSession(req, res);
  if (!session?.user?.email)
    return res.status(401).json({ error: 'Not authenticated' });

  const { classroomId, email } = req.body || {};
  if (!classroomId || !email)
    return res.status(400).json({ error: 'Missing classroomId or email' });

  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });
  } catch {
    return res.status(403).json({ error: 'User not found' });
  }

  const role = String(user.role || '').toLowerCase();

  let classroom;
  try {
    classroom = await prisma.classroom.findUniqueOrThrow({
      where: { classroomId: Number(classroomId) }
    });
  } catch {
    return res.status(404).json({ error: 'Class not found' });
  }

  if (
    role === 'teacher' &&
    Number(user.id) !== Number(classroom.classroomTeacherId)
  ) {
    return res
      .status(403)
      .json({ error: 'Forbidden: cannot invite to class you do not own' });
  }

  try {
    // Minimal: return success (implement email/invite DB as needed)
    return res.status(200).json({ message: `Invite stub sent to ${email}` });
  } catch (err) {
    console.error('Invite error', err);
    return res.status(500).json({ error: 'Failed to create invite' });
  }
}
