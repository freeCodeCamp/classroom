/* The code you provided is a configuration file for NextAuth, a library for handling authentication in Next.js
applications. */
import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../prisma/prisma';

/* The `authOptions` object is a configuration object that is used to set up authentication options for the NextAuth
library. Here is a breakdown of what each property in the object does: */
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
    /**
     * The function redirects a URL to either a relative URL or a URL on the same origin.
     * @returns the callback URL. If the URL starts with a forward slash ("/"), it appends the URL to the base URL and
     * returns the result. If the URL has the same origin as the base URL, it returns the URL as is. Otherwise, it returns
     * the base URL.
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  }
};

/* The `if (process.env.GITHUB_OAUTH_PROVIDER_ENABLED == 'true') {` statement is checking the value of the environment
variable `GITHUB_OAUTH_PROVIDER_ENABLED`. If the value is equal to the string `'true'`, it means that the GitHub OAuth
provider is enabled. In that case, it adds the GitHub provider configuration to the `providers` array in the
`authOptions` object. */
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

/* The line `export default NextAuth(authOptions);` is exporting a default value from the module. In this case, it is
exporting the result of calling the `NextAuth` function with the `authOptions` object as an argument. This means that
when this module is imported in another file, the default exported value will be the result of the `NextAuth` function
call, which is typically a configured instance of the NextAuth library. */
export default NextAuth(authOptions);

/* Test Cases
  Auth0 Google/GitHub -> GitHub
  GitHub -> Auth0 Google/GitHub

  Tested on Incognito tab of Microsoft Edge, Brave, Safari, Chrome, FireFox*/
