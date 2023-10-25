# Gitpod Setup Instructions

Please review Gitpod docs if you are not familiar with it.

- [How to get started with Gitpod Codespaces](https://www.gitpod.io/docs/introduction/getting-started)

## Step 1: Enable Gitpod

If you want a ready-made dev environment in your browser, make a fork of this repository and then prefix your fork with "gitpod.io/#". For example,

`gitpod.io/#https://github.com/{your-github-user-name}/classroom`

## Step 2: Set up a NextAuth Provider App

You need to set up a NextAuth Provider and run the app.

For dev environments, we have enabled use of the Github Provider. Please read and follow their [guide](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) to set up the oauth app.

## Step 3: Update the .env file

You will need to update the .env file inside Github Codespaces with the following:

- Set DataBase Url to:
  `postgresql://postgres:password@localhost:5432/classroom`

- Set mock user data URL to:  
  `https://3001-${GITPOD_WORKSPACE_URL:8}/data`

- Set homepage url to:  
  `https://3000-${GITPOD_WORKSPACE_URL:8}`

- Set callback url to: `https://3000-${GITPOD_WORKSPACE_URL:8}/api/auth/callback/github`

- Set NEXTAUTH_URL to:
  `https://3000-${GITPOD_WORKSPACE_URL:8}`

- Set GITHUB_ID to:
  - Your Client ID is shown in the OAuth app page (generated at step 2). Copy and paste to GITHUB_ID.
- Set GITHUB_SECRET to:
  - Generate a **new** Client Secret. Then copy and paste to GITHUB_SECRET.

Please follow the "Setup Instructions" in the terminal for more information.

Within freeCodeCamp Classroom, Gitpod is on par with Github Codespaces so that you can use either.

## Additional Steps to take after finishing Gitpod Setup:

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

Happy coding!
