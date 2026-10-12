import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import prisma from '../prisma/prisma';
import type { User } from '../generated/prisma/client';

export type SessionUser = {
  session: Session;
  user: Pick<User, 'id' | 'email' | 'role'>;
};

export async function getSessionUser(
  ctx: Pick<GetServerSidePropsContext, 'req' | 'res'>
): Promise<SessionUser | null> {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const email = session?.user?.email;
  if (!session || !email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });
  return user ? { session, user } : null;
}
