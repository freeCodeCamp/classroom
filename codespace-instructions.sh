#!/bin/bash
code .env
echo \<------------ SETUP INSTRUCTIONS ------------\>
echo 
echo Almost done! Just need to set up a NextAuth Provider and run the app.
echo
echo 1.\) For dev environments, we have enabled use of the Github Provider. Please follow their guide:
echo https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app
echo
echo The mock user data URL is:   
echo https://${CODESPACE_NAME}-3001.preview.app.github.dev/data
echo
echo The homepage is:   
echo https://${CODESPACE_NAME}-3000.preview.app.github.dev
echo 
echo The callback url is:
echo https://${CODESPACE_NAME}-3000.preview.app.github.dev/api/auth/callback/github
echo
echo 2.\) Set NEXTAUTH_URL in .env to https://${CODESPACE_NAME}-3000.preview.app.github.dev
echo
echo 3.\) To setup GITHUB_ID and GITHUB_SECRET after setting up the OAuth app: 
echo      -Your Client ID is shown in the OAuth app page. Copy and paste to GITHUB_ID. 
echo      -Next generate a new Client Secret. Then copy and paste to GITHUB_SECRET.
echo
echo Additional Steps to take After Finishing Gitpod Setup:
echo
echo 1.\) Run: npm run develop
echo
echo 2.\) Check to see if the website is functional and you can sign in and authorize yourself using your GitHub profile.
echo
echo 3.\) After successfully signing in, sign out and open a new terminal.
echo
echo 4.\) Run: npx prisma studio
echo
echo 5.\) In Prisma Studio, go to User. Under the “roles” column, enter TEACHER or ADMIN. And click on the “Save Changes” button.
echo
echo 6.\) Run npm run mock-fcc-data
echo 
echo 7.\) Go to the ports tab and set the visibility to public for the 3000 and 3001 ports. 
echo
echo Happy coding!