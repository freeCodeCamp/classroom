// pages/api/join_class.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerAuthSession(req, res);
  if (!session?.user?.email)
    return res.status(401).json({ error: 'Not authenticated' });

  const { classroomId } = req.body || {};
  if (!classroomId)
    return res.status(400).json({ error: 'Missing classroomId' });

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
  if (role !== 'student' && role !== 'admin')
    return res.status(403).json({ error: 'Only students can join classes' });

  try {
    const updated = await prisma.classroom.update({
      where: { classroomId: Number(classroomId) },
      data: {
        // assumes relation field `students` exists in schema
        students: {
          connect: { id: Number(user.id) }
        }
      }
    });
    return res.status(200).json({ message: 'Joined', classroom: updated });
  } catch (err) {
    console.error('Join class error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to join (maybe relation missing)' });
  }
}
