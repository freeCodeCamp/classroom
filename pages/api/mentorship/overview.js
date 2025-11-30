// pages/api/mentorship/overview.js
import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1️⃣ Mentors + user + pairs
    const mentors = await prisma.mentorProfile.findMany({
      include: {
        user: true,
        pairs: {
          include: {
            mentee: { include: { user: true } }
          }
        }
      },
      orderBy: { id: 'asc' } // stable order for tie-breaking
    });

    const formattedMentors = mentors.map(m => {
      const subjects = m.subjects || [];

      let priorities = {};
      try {
        priorities = m.subjectPriorities ? JSON.parse(m.subjectPriorities) : {};
      } catch {
        priorities = {};
      }

      return {
        id: m.id,
        user: m.user,
        subjects,
        subjectPriorities: priorities, // OBJECT, not string
        pairs: m.pairs || []
      };
    });

    // 2️⃣ Mentees + user
    const mentees = await prisma.menteeRequest.findMany({
      include: { user: true },
      orderBy: { id: 'asc' }
    });

    const formattedMentees = mentees.map(m => ({
      id: m.id,
      user: m.user,
      subjects: m.goal ? [m.goal] : [],
      status: m.status
    }));

    // 3️⃣ All current matches
    const pairs = await prisma.mentorMenteePair.findMany({
      include: {
        mentor: { include: { user: true } },
        mentee: { include: { user: true } }
      },
      orderBy: { id: 'asc' }
    });

    return res.status(200).json({
      mentors: formattedMentors,
      mentees: formattedMentees,
      pairs
    });
  } catch (error) {
    console.error('overview error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
