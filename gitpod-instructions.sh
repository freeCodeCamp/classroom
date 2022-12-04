#!/bin/bash
code .env
echo \<------------ SETUP INSTRUCTIONS ------------\>
echo 
echo Almost done! Just need to set up a NextAuth Provider and run the app.
echo
echo 1.\) For dev environments, we have enabled use of the Github Provider. Please follow their guide:
echo https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app
echo
echo The homepage is:   
echo https://3000-${GITPOD_WORKSPACE_URL:8}
echo 
echo The callback url is:
echo https://3000-${GITPOD_WORKSPACE_URL:8}/api/auth/callback/github
echo
echo 2.\) Set NEXTAUTH_URL in .env to https://3000-${GITPOD_WORKSPACE_URL:8}
echo
echo 3.\) To setup GITHUB_ID and GITHUB_SECRET after setting up the OAuth app: 
echo      -Your Client ID is shown in the OAuth app page. Copy and paste to GitHub_ID. 
echo      -Next generate a new Client Secret. Then copy and paste to GitHub_Secret.
echo
echo Additional Steps to take After Finishing Gitpod Setup:
echo
echo 1.\) Run: npm run develop
echo      -This will run the application.
echo
echo 2.\) Check to see if the website is functional and you can sign in and authorize yourself using your GitHub profile.
echo
echo 3.\) After successfully signing in, sign out and open a new terminal.
echo
echo 4.\) Run: npx prisma studio
echo      -Follow the localhost link.
echo
echo 5.\) In Prisma Studio, go to User. Under the “roles” column, enter TEACHER or ADMIN. And click on the “Save Changes” button.
echo      -Rerun application to test new privileges.
echo
echo Happy coding!