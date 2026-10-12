import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../prisma/prisma';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      // Enable dangerous account linking in dev environment
      ...(process.env.DANGEROUS_ACCOUNT_LINKING_ENABLED == 'true'
        ? { allowDangerousEmailAccountLinking: true }
        : {})
    })
    // ...add more providers here
  ],
  pages: { signIn: '/signin', error: '/signin' },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.role = user.role;
        session.user.id = user.id;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);
