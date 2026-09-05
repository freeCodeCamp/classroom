import { getServerSession } from 'next-auth';
import prisma from '../../prisma/prisma';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  if (!session) {
    return res.status(403).end();
  }

  let user;

  try {
    user = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email },
      select: { role: true }
    });
  } catch (error) {
    return res.status(403).end();
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { role: { contains: q, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  res.status(200).json(users);
}
