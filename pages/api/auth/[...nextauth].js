import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../prisma/prisma';

export const authOptions = {
  site: process.env.NEXTAUTH_URL,

  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
      // Enable dangerous account linking in dev environment
      ...(process.env.DANGEROUS_ACCOUNT_LINKING_ENABLED == 'true'
        ? { allowDangerousEmailAccountLinking: true }
        : {})
    })
    // ...add more providers here
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  }
};

if (process.env.GITHUB_OAUTH_PROVIDER_ENABLED == 'true') {
  authOptions.providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Enable dangerous account linking in dev environment
      ...(process.env.DANGEROUS_ACCOUNT_LINKING_ENABLED == 'true'
        ? { allowDangerousEmailAccountLinking: true }
        : {})
    })
  );
}

export default NextAuth(authOptions);

/* Test Cases
  Auth0 Google/GitHub -> GitHub
  GitHub -> Auth0 Google/GitHub

  Tested on Incognito tab of Microsoft Edge, Brave, Safari, Chrome, FireFox*/
