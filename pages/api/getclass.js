// pages/api/get_class.js
import prisma from '../../prisma/prisma';

export default async function handler(req, res) {
  const { classroomId } = req.query || {};
  if (!classroomId)
    return res.status(400).json({ error: 'Missing classroomId' });

  try {
    const classroom = await prisma.classroom.findUnique({
      where: { classroomId: Number(classroomId) }
    });
    if (!classroom) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(classroom);
  } catch (err) {
    console.error('get_class error:', err);
    return res.status(500).json({ error: 'Failed to fetch' });
  }
}
