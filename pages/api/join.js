// pages/api/join.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerAuthSession(req, res);
  if (!session?.user)
    return res.status(401).json({ error: 'Not authenticated' });

  const { classroomId } = req.body || {};
  if (!classroomId)
    return res.status(400).json({ error: 'Missing classroomId' });

  try {
    const classRow = await prisma.classroom.findUnique({
      where: { classroomId }
    });
    if (!classRow) return res.status(404).json({ error: 'Class not found' });

    // This requires Classroom.students relation in Prisma schema
    await prisma.classroom.update({
      where: { classroomId },
      data: { students: { connect: { id: session.user.id } } }
    });

    return res.status(200).json({ message: 'Joined class' });
  } catch (err) {
    console.error('join error:', err);
    return res.status(500).json({
      error:
        'Failed to join. Ensure Classroom.students relation exists in Prisma schema.'
    });
  }
}
