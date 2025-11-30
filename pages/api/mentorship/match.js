// pages/api/mentorship/match.js
import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1️⃣ Get all pending mentees
    const mentees = await prisma.menteeRequest.findMany({
      where: { status: 'pending' },
      orderBy: { id: 'asc' }
    });

    if (mentees.length === 0) {
      return res.status(200).json({
        message: 'No pending mentees',
        createdPairsCount: 0
      });
    }

    // 2️⃣ Get all mentors
    const mentors = await prisma.mentorProfile.findMany({
      orderBy: { id: 'asc' }
    });

    let createdPairsCount = 0;

    // 3️⃣ Multi-subject matching
    for (const mentee of mentees) {
      const menteeSubjects = mentee.subjects || [];
      if (menteeSubjects.length === 0) continue;

      for (const subject of menteeSubjects) {
        const lowerSubject = subject.toLowerCase();

        let bestMentor = null;
        let bestPriority = -1;

        for (const mentor of mentors) {
          const mentorSubjects = mentor.subjects || [];

          // mentor must teach this subject
          if (
            !mentorSubjects.map(s => s.toLowerCase()).includes(lowerSubject)
          ) {
            continue;
          }

          // parse subjectPriorities JSON
          let priorityMap = {};
          try {
            priorityMap = mentor.subjectPriorities
              ? JSON.parse(mentor.subjectPriorities)
              : {};
          } catch {
            priorityMap = {};
          }

          const p = Number(priorityMap[subject] ?? 1);

          // pick highest priority mentor
          if (bestMentor === null || p > bestPriority) {
            bestMentor = mentor;
            bestPriority = p;
          }
        }

        if (!bestMentor) continue;

        // 4️⃣ avoid duplicate mentor–mentee pair
        const exists = await prisma.mentorMenteePair.findFirst({
          where: {
            mentorId: bestMentor.id,
            menteeId: mentee.id
          }
        });

        if (!exists) {
          await prisma.mentorMenteePair.create({
            data: {
              mentorId: bestMentor.id,
              menteeId: mentee.id
            }
          });
          createdPairsCount++;
        }
      }

      // 5️⃣ mark mentee as matched after processing all subjects
      await prisma.menteeRequest.update({
        where: { id: mentee.id },
        data: { status: 'matched' }
      });
    }

    return res.status(200).json({
      message: 'Multi-subject matching completed',
      createdPairsCount
    });
  } catch (error) {
    console.error('match error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
