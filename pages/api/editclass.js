/* The line `import prisma from '../../prisma/prisma';` is importing the Prisma client from the `prisma` directory. Prisma
is an Object-Relational Mapping (ORM) tool that allows you to interact with your database using JavaScript. By importing
the Prisma client, you can use its methods to perform database operations such as querying, creating, updating, and
deleting data. */
import prisma from '../../prisma/prisma';
/* The line `import { unstable_getServerSession } from 'next-auth';` is importing the `unstable_getServerSession` function
from the `next-auth` library. This function is used to retrieve the session object for the current user on the
server-side. It is recommended to use this function when working with Next.js and NextAuth.js for server-side
authentication. */
import { unstable_getServerSession } from 'next-auth';
/* The line `import { authOptions } from './auth/[...nextauth]';` is importing the `authOptions` object from the
`auth/[...nextauth]` file. This file likely contains the configuration options for authentication using NextAuth.js. By
importing the `authOptions` object, it can be used in the `handle` function to retrieve the session object for the
current user. */
import { authOptions } from './auth/[...nextauth]';

/* The line `export default async function handle(req, res) {` is defining an asynchronous function named `handle` that
takes in two parameters: `req` and `res`. */
export default async function handle(req, res) {
  // unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  const data = req.body;
  let user;

  /* The line `if (!req.method == 'PUT') {` is checking if the HTTP request method is not equal to 'PUT'. */
  if (!req.method == 'PUT') {
    res.status(405).end();
  }

  /* The line `if (!session) {` is checking if the `session` variable is falsy. If `session` is falsy, it means that there
  is no active session for the current user. In this case, the code block inside the `if` statement will be executed,
  and the server will respond with a status code of 403 (Forbidden) and end the response. */
  if (!session) {
    res.status(403).end();
  }

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that queries the database to find a unique user based on their email. If an error
  occurs during the execution of this code, the `catch` block will be executed. */
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: session.user.email
      },
      select: {
        role: true
      }
    });
  } catch {
    /* The line `return res.status(403).end();` is setting the HTTP response status code to 403 (Forbidden) and ending the
    response. This means that the server is denying access to the requested resource because the user does not have the
    necessary permissions. */
    return res.status(403).end();
  }

  /* The line `if (user.role !== 'TEACHER') {` is checking if the `role` property of the `user` object is not equal to the
  string `'TEACHER'`. If the condition is true, it means that the user's role is not 'TEACHER', and the code block
  inside the `if` statement will be executed. In this case, the server will respond with a status code of 403
  (Forbidden) and end the response, denying access to the requested resource because the user does not have the
  necessary permissions. */
  if (user.role !== 'TEACHER') {
    return res.status(403).end();
  }

  /* The line `if (data.fccCertifications.length === 0)` is checking if the length of the `fccCertifications` property of
  the `data` object is equal to 0. */
  if (data.fccCertifications.length === 0) {
    data.fccCertifications = undefined;
  }

  if (
    data.className === undefined &&
    data.description === undefined &&
    data.fccCertifications === undefined
  ) {
    /* The line `return res.status(304).end();` is setting the HTTP response status code to 304 (Not Modified) and ending
    the response. This means that the server is indicating that the requested resource has not been modified since the
    last time it was accessed, and there is no need to send the requested resource again. This is typically used in
    caching scenarios, where the client can use its cached version of the resource instead of making a new request to
    the server. */
    return res.status(304).end();
  }

  await prisma.classroom.update({
    where: {
      classroomId: data.classroomId
    },
    data: {
      classroomName: data.className,
      description: data.description,
      fccCertifications: data.fccCertifications
    }
  });
  /* The line `return res.status(200).end();` is setting the HTTP response status code to 200 (OK) and ending the response.
  This means that the server is indicating that the request was successful and there is no additional data to send in
  the response body. The client receiving this response will interpret it as a successful request. */
  return res.status(200).end();
}
