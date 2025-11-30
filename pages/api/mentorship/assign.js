import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { menteeId } = req.body;

    if (!menteeId) {
      return res.status(400).json({ error: 'menteeId is required' });
    }

    // 1️⃣ Fetch mentee request
    const mentee = await prisma.menteeRequest.findUnique({
      where: { id: menteeId }
    });

    if (!mentee) {
      return res.status(404).json({ error: 'Mentee request not found' });
    }

    const menteeSubject = mentee.goal.toLowerCase();

    // 2️⃣ Fetch all available mentors
    const mentors = await prisma.mentorProfile.findMany({
      where: { available: true }
    });

    if (!mentors.length) {
      return res.status(400).json({ error: 'No mentors available' });
    }

    // 3️⃣ Priority Matching
    let bestMatch = null;
    let highestPriority = -1;

    for (const mentor of mentors) {
      const subjects = JSON.parse(mentor.skills);

      for (const subj of subjects) {
        if (subj.subject.toLowerCase() === menteeSubject) {
          if (subj.priority > highestPriority) {
            highestPriority = subj.priority;
            bestMatch = mentor;
          }
        }
      }
    }

    // 4️⃣ If no mentor teaches that subject
    if (!bestMatch) {
      return res.status(400).json({
        error: `No mentor teaches the subject ${menteeSubject}`
      });
    }

    // 5️⃣ Create the match
    const match = await prisma.mentorMenteePair.create({
      data: {
        mentorId: bestMatch.id,
        menteeId
      }
    });

    // 6️⃣ Mark mentee as matched
    await prisma.menteeRequest.update({
      where: { id: menteeId },
      data: { status: 'matched' }
    });

    return res.status(200).json({
      message: 'Match successful',
      mentor: bestMatch,
      mentee,
      match
    });
  } catch (error) {
    console.error('assign error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
