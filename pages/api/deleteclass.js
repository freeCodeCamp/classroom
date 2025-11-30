// pages/api/deleteclass.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerAuthSession(req, res);
  if (!session?.user)
    return res.status(401).json({ error: 'Not authenticated' });

  const role = String(session.user.role || '').toLowerCase();
  if (role !== 'teacher' && role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  const classroomId = req.body?.classroomId;
  if (!classroomId)
    return res.status(400).json({ error: 'Missing classroomId' });

  try {
    const classRow = await prisma.classroom.findUnique({
      where: { classroomId },
      select: { classroomTeacherId: true }
    });
    if (!classRow) return res.status(404).json({ error: 'Class not found' });

    if (
      role === 'teacher' &&
      String(classRow.classroomTeacherId) !== String(session.user.id)
    )
      return res
        .status(403)
        .json({ error: "Cannot delete class you don't own" });

    await prisma.classroom.delete({ where: { classroomId } });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('deleteclass error:', err);
    return res.status(500).json({ error: 'Failed to delete class' });
  }
}
