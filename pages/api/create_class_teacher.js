// pages/api/create_class_teacher.js
import prisma from '../../prisma/prisma';
import { getServerAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  console.log('create_class_teacher: method', req.method);
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerAuthSession(req, res);
  console.log('create_class_teacher: session:', session?.user);

  if (!session || !session.user)
    return res.status(401).json({ error: 'Not authenticated' });

  const role = String(session.user.role || '').toLowerCase();
  if (role !== 'teacher' && role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  const { classroomName, description, classroomTeacherId } = req.body || {};
  if (!classroomName || classroomTeacherId === undefined) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const created = await prisma.classroom.create({
      data: {
        classroomName,
        description: description || '',
        classroomTeacherId
      }
    });
    console.log('create_class_teacher: created:', created);
    return res.status(201).json(created);
  } catch (err) {
    console.error('create_class_teacher error:', err);
    return res.status(500).json({ error: 'Failed to create' });
  }
}
