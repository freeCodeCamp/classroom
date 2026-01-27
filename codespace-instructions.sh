#!/bin/bash
code .env

instructions=$(cat <<END
<------------ SETUP INSTRUCTIONS ------------>

Almost done! Just need to set up a NextAuth Provider and run the app.

1.) For dev environments, we have enabled use of the Github Provider. Please follow their guide:
https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app

The mock user data URL is:
https://${CODESPACE_NAME}-3002.app.github.dev/data

The homepage is:
https://${CODESPACE_NAME}-3001.app.github.dev

The callback URL is:
https://${CODESPACE_NAME}-3001.app.github.dev/api/auth/callback/github

2.) Set NEXTAUTH_URL in .env to https://${CODESPACE_NAME}-3001.app.github.dev

3.) To setup GITHUB_ID and GITHUB_SECRET after setting up the OAuth app:
-Your Client ID is shown in the OAuth app page. Copy and paste it to GITHUB_ID.
-Next, generate a new Client Secret. Then copy and paste it to GITHUB_SECRET.

Additional Steps to take After Finishing Codespaces Setup:

1.) Run: npm run develop

2.) Check to see if the website is functional and you can sign in and authorize yourself using your GitHub profile.

3.) After successfully signing in, sign out and open a new terminal.

4.) Run: npx prisma studio

5.) In Prisma Studio, go to User. Under the “roles” column, enter TEACHER or ADMIN. And click on the “Save Changes” button.

6.) Run npm run mock-fcc-data

7.) Go to the ports tab and set the visibility to public for the 3001 and 3002 ports.

8.) Optional: To connect to a PostgreSQL server in a db container via psql PostgreSQL client in this app container

Here is a diagram that illustrates the two containers and the forwarded port:

app container (your code) <-- forwarded port 5432 --> db container (PostgreSQL)
                                                                   |
                                                                   v
                                                                   localhost:5432

https://en.wikipedia.org/wiki/North-south_traffic

Based on the most commonly deployed network topology of systems within a data center,
north-south traffic typically indicates data flow that either enters
or leaves the data center from/to a system physically residing outside the data center,
such as user to server.

Southbound traffic is data entering the data center
(through a firewall and/or other networking infrastructure).

Data exiting the data center is northbound traffic,
commonly routed through a firewall to Internet space.

The other direction of traffic flow is east-west traffic
which typically indicates data flow within a data center.

9.) Optional: Run: psql postgresql://postgres:password@localhost:5432/classroom

10.) Optional:

psql (15.3 (Debian 15.3-0+deb12u1))
Type "help" for help.

classroom=# \dt
               List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | Account           | table | postgres
 public | Classroom         | table | postgres
 public | Session           | table | postgres
 public | User              | table | postgres
 public | VerificationToken | table | postgres
(5 rows)

classroom=# \q

Happy coding!
END
)

echo "$instructions"
