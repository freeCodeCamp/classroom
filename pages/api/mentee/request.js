import prisma from '../../../prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // IMPORTANT
    if (session.user.role !== 'student') {
      return res
        .status(403)
        .json({ error: 'Only students can request mentors' });
    }

    const userId = session.user.id;
    const { subjects } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one subject is required' });
    }

    const menteeReq = await prisma.menteeRequest.create({
      data: {
        userId,
        subjects, // <<-- FIXED
        status: 'pending'
      }
    });

    return res.status(200).json({
      message: 'Request submitted successfully',
      data: menteeReq
    });
  } catch (err) {
    console.error('MENTEE REQUEST ERROR:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
