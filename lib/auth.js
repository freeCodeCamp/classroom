// lib/auth.js
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../prisma/prisma';
import { getServerSession } from 'next-auth/next'; // server-only
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role?.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  }
};

export function getServerAuthSession(req, res) {
  return getServerSession(req, res, authOptions);
}
