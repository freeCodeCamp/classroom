import { getSession } from 'next-auth/react';
import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { classroomId } = req.body;

  try {
    await prisma.classroom.update({
      where: { classroomId },
      data: {
        students: {
          connect: { email: session.user.email } // ✅ attach logged in student
        }
      }
    });

    return res.json({ message: 'Joined classroom successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
