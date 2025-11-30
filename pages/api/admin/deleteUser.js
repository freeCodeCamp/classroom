import { getSession } from 'next-auth/react';
import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    await prisma.user.delete({ where: { email } });
    return res.status(200).json({ message: '✅ User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}
