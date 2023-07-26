/* The line `import prisma from '../../prisma/prisma';` is importing the Prisma client from the `prisma` directory. Prisma
is an Object-Relational Mapping (ORM) tool that allows you to interact with your database using JavaScript. By importing
the Prisma client, you can use its methods to perform database operations such as querying, creating, updating, and
deleting data. */
import prisma from '../../prisma/prisma';
/* The line `import { unstable_getServerSession } from 'next-auth';` is importing the `unstable_getServerSession` function
from the `next-auth` library. This function is used to retrieve the user session on the server-side in Next.js
applications. It is recommended to use this function instead of `getSession` when working with Next.js, as it provides
better performance and security. */
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

/* The line `export default async function handle(req, res) {` is defining an asynchronous function named `handle` that
takes in two parameters: `req` and `res`. This function is intended to handle HTTP requests and responses. */
export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  /* The line `const session = await unstable_getServerSession(req, res, authOptions);` is retrieving the user session on
  the server-side using the `unstable_getServerSession` function. */
  const session = await unstable_getServerSession(req, res, authOptions);

  /* The line `if (!req.method == 'PUT') {` is checking if the HTTP request method is not equal to 'PUT'. */
  if (!req.method == 'PUT') {
    res.status(405).end();
  }

  /* The line `if (!session) {` is checking if the `session` variable is falsy. If the `session` variable is falsy, it
  means that the user is not authenticated or does not have a valid session. In this case, the code block inside the
  `if` statement will be executed, and the server will respond with a status code of 403 (Forbidden) and end the
  response. */
  if (!session) {
    res.status(403).end();
  }

  /* The line `const body = req.body;` is assigning the value of `req.body` to the variable `body`. */
  const body = req.body;
  // Grab user info here
  /* The code `const userInfo = await prisma.user.findUnique({ ... })` is using the Prisma client to query the `user` table
  in the database and find a unique user based on the provided condition. In this case, the condition is that the
  `email` column of the user should match the `email` property of the `session.user` object. */
  const userInfo = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true
    }
  });
  // Grab class info here
  /* The code `const checkClass = await prisma.classroom.findUniqueOrThrow({ ... })` is using the Prisma client to query
  the `classroom` table in the database and find a unique classroom based on the provided condition. In this case, the
  condition is that the `classroomId` column of the classroom should match the value of `body.join[0]`. */
  const checkClass = await prisma.classroom.findUniqueOrThrow({
    where: {
      classroomId: body.join[0]
    },
    select: {
      fccUserIds: true
    }
  });
  /* The line `const existsInClassroom = checkClass.fccUserIds.includes(userInfo.id);` is checking if the `userInfo.id`
  exists in the `fccUserIds` array of the `checkClass` object. */
  const existsInClassroom = checkClass.fccUserIds.includes(userInfo.id);
  /* The line `if (existsInClassroom) {` is checking if the `existsInClassroom` variable is truthy. If the
  `existsInClassroom` variable is truthy, it means that the user already exists in the classroom, and the code block
  inside the `if` statement will be executed. In this case, the server will respond with a status code of 409 (Conflict)
  and end the response. */
  if (existsInClassroom) {
    res.status(409).end();
  }
  // TODO: Once we allow multiple teachers inside of a classroom, make sure that the teachers
  // are placed inside of the teacher array rather than as a regular student
  else if (userInfo.role === 'NONE') {
    // This runs only when a new user attempts to join a classroom.
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        role: 'STUDENT'
      }
    });
  }
  // Update classroom with user id
  await prisma.classroom.update({
    where: {
      classroomId: body.join[0]
    },
    data: {
      fccUserIds: { push: userInfo.id }
    }
  });
  /* The line `res.status(200).end();` is setting the HTTP response status code to 200 (OK) and ending the response. This
  indicates that the request was successful and there is no additional data to be sent in the response body. */
  res.status(200).end();
}
