#!/bin/bash
echo \<------------ SETUP INSTRUCTIONS ------------\>
echo 
echo Almost done! Just need to set up a NextAuth Provider and run the app.
echo 1.\) For dev environments, we have enabled use of the Github Provider. Please follow their guide:
echo https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app
echo
echo The homepage is:   
echo https://3000-${GITPOD_WORKSPACE_URL:8}
echo 
echo The callback url is:
echo https://3000-${GITPOD_WORKSPACE_URL:8}/api/auth/callback/github
echo
echo
echo 2.\) Set NEXTAUTH_URL in .env to https://3000-${GITPOD_WORKSPACE_URL:8}
echo 3.\) Set GITHUB_ID and GITHUB_SECRET to what github has given you.
echo
echo 4.\) npm run develop will run the application
echo 5.\) To give yourself TEACHER or ADMIN role once signed in, you can access the Users table with npx prisma studio
echo Happy coding!
