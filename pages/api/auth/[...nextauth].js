import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../prisma/prisma';

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
    // Store user.id and role in JWT
    async jwt({ token, user }) {
      // On first login, store user.id
      if (user) {
        token.id = user.id;
      }

      // Always fetch role from DB
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id }
        });

        // DO NOT UPPERCASE (this was your bug)
        token.role = dbUser?.role || 'none';
      }

      return token;
    },

    // Make role available in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // student / mentor
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
