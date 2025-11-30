// pages/api/mentor/setup.js
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

    const userId = session.user.id;
    const { subjects, priorities, about } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one subject is required' });
    }

    // Convert priorities object → JSON string
    const prioritiesJson = JSON.stringify(priorities || {});

    const mentor = await prisma.mentorProfile.upsert({
      where: { userId },
      update: {
        subjects,
        subjectPriorities: prioritiesJson,
        about: about || '',
        available: true
      },
      create: {
        userId,
        subjects,
        subjectPriorities: prioritiesJson,
        about: about || '',
        available: true
      }
    });

    return res.status(200).json(mentor);
  } catch (error) {
    console.error('mentor setup API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
