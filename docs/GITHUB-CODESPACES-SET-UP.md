# Github Codespaces Setup Instructions

If you have used GitHub Codespaces in other projects, doing the same in freeCodeCamp Classroom should be straightforward. We recommend reading the following if you are unfamiliar with Github Codespaces.

- [Github Codespaces Overview](https://docs.github.com/en/codespaces/overview)
- [How to get started with Github Codespaces](https://docs.github.com/en/codespaces/getting-started)

## Step 1: Enable Github Codespace

- On our [github](https://github.com/freeCodeCamp/classroom), look for a green button called Code on the top right.
- Click on the button to reveal the dropdown
- Observe that there are two options, Local and Codespaces which you can switch through
- Get to the Codespaces option
- Click on Open CodeSpace. Github will take care of making the codespace for you. Don't worry if it's taking a while, it can take up to 10 mins.

## Step 2: Set up a NextAuth Provider App

You need to set up a NextAuth Provider and run the app.

For dev environments, we have enabled use of the Github Provider. Please read and follow their [guide](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) to set up the oauth app.

## Step 3: Update the .env file

You will need to update the .env file inside Github Codespaces with the following:

- Set DataBase Url to:
  `postgresql://postgres:password@localhost:5432/classroom`

- Set mock user data URL to:  
  `https://${CODESPACE_NAME}-3001.preview.app.github.dev/data`

- Set homepage url to:  
  `https://${CODESPACE_NAME}-3000.preview.app.github.dev`

- Set callback url to:
  `https://${CODESPACE_NAME}-3000.preview.app.github.dev/api/auth/callback/github`

- Set NEXTAUTH_URL to:
  `https://${CODESPACE_NAME}-3000.preview.app.github.dev`

- Set GITHUB_ID to:
  - Your Client ID is shown in the OAuth app page (generated at step 2). Copy and paste to GITHUB_ID.
- Set GITHUB_SECRET to:
  - Generate a **new** Client Secret. Then copy and paste to GITHUB_SECRET.

Please follow the "Setup Instructions" in the terminal for more information.

Within freeCodeCamp Classroom, GitHub Codespaces is on par with Gitpod so that you can use either.

## Additional Steps to take after finishing Github Codespaces setup:

1. Open a terminal and paste the following to start the application.

```console
   npm run develop
```

2. Check to see if the website is functional and you can sign in and authorize yourself using your GitHub profile.

3. After successfully signing in, sign out and open a new terminal.

4. Start the ORM tool, [Prisma Studio](https://www.prisma.io/docs/concepts/overview/what-is-prisma).

```console
   npx prisma studio
```

5. In Prisma Studio, go to User. Under the “roles” column, enter TEACHER or ADMIN. And click on the “Save Changes” button.

6. Feed in the mock student data being used.

```console
   npm run mock-fcc-data
```

7. Go to the ports tab and set the visibility to public for the 3000 and 3001 ports.

Happy coding!
