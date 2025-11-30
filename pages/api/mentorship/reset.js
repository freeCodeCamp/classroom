import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      error: 'Use GET or POST /api/mentorship/reset'
    });
  }

  try {
    // Delete mentor-mentee matchmaking data ONLY
    await prisma.mentorMenteePair.deleteMany().catch(() => {});
    await prisma.menteeRequest.deleteMany().catch(() => {});
    await prisma.mentorRequest?.deleteMany?.().catch(() => {});
    await prisma.mentorProfile?.deleteMany?.().catch(() => {});

    return res.status(200).json({
      message:
        'Mentorship data cleared (requests, profiles, pairs). Login users are SAFE.'
    });
  } catch (error) {
    console.error('RESET ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}
