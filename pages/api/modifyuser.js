/* The line `import prisma from '../../prisma/prisma';` is importing the Prisma client from the `prisma` directory. Prisma
is an Object-Relational Mapping (ORM) tool that allows you to interact with your database using JavaScript. The `prisma`
object provides methods for querying, creating, updating, and deleting data in the database. */
import prisma from '../../prisma/prisma';
/* The line `import { unstable_getServerSession } from 'next-auth';` is importing the `unstable_getServerSession` function
from the `next-auth` library. */
import { unstable_getServerSession } from 'next-auth';
/* The line `import { authOptions } from './auth/[...nextauth]';` is importing the `authOptions` object from the
`auth/[...nextauth]` file. This file likely contains the configuration options for the authentication system being used
in the application. By importing the `authOptions` object, the code can access and use these configuration options in
the `handle` function. */
import { authOptions } from './auth/[...nextauth]';

/* The line `export default async function handle(req, res) {` is defining an asynchronous function named `handle` that
takes in two parameters: `req` and `res`. This function is intended to handle HTTP requests and responses. The `req`
parameter represents the incoming request, while the `res` parameter represents the response that will be sent back to
the client. */
export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);
  /* The line `let user;` is declaring a variable named `user` using the `let` keyword. This variable is declared without
  an initial value, so it is initially set to `undefined`. It is likely that this variable will be used later in the
  code to store information about a user retrieved from the database. */
  let user;
  /* The line `let userToBeChanged;` is declaring a variable named `userToBeChanged` using the `let` keyword. This variable
  is declared without an initial value, so it is initially set to `undefined`. It is likely that this variable will be
  used later in the code to store information about a user that is going to be changed in the database. */
  let userToBeChanged;

  /* The line `if (!req.method == 'POST') {` is checking if the HTTP request method is not equal to 'POST'. */
  if (!req.method == 'POST') {
    return res.status(405).end();
  }

  /* The line `if (!session) {` is checking if the `session` variable is falsy. If the `session` variable is falsy, it
  means that the user is not authenticated or the session has expired. In this case, the code returns a 403 Forbidden
  status code and ends the response. */
  if (!session) {
    return res.status(403).end();
  }

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that queries the database to find a unique user based on their email. If an error
  occurs during the execution of this code, such as the user not being found or an error with the database connection,
  the code will jump to the `catch` block. */
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
    return res.status(403).end();
  }

  //checks whether user is admin
  if (user.role !== 'ADMIN') {
    return res.status(403).end();
  }

  /* The line `const body = req.body;` is assigning the value of `req.body` to a constant variable named `body`. */
  const body = req.body;

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that queries the database to find a unique user based on their email. If an error
  occurs during the execution of this code, such as the user not being found or an error with the database connection,
  the code will jump to the `catch` block. */
  try {
    userToBeChanged = await prisma.user.findUniqueOrThrow({
      where: {
        id: body.id
      },
      select: {
        role: true
      }
    });
  } catch {
    /* The line `return res.status(403).end();` is sending a response with a status code of 403 (Forbidden) and ending the
    response. This indicates that the user is not authorized to access the requested resource or perform the requested
    action. */
    return res.status(403).end();
  }

  /* The line `if (body.name.length === 0) {` is checking if the length of the `name` property in the `body` object is
  equal to 0. */
  if (body.name.length === 0) {
    body.name = undefined;
  }

  /* The line `if (body.email.length === 0) {` is checking if the length of the `email` property in the `body` object is
  equal to 0. If the length is 0, it means that the `email` property is an empty string. In this case, the code sets the
  `email` property to `undefined`. This is likely done to handle the case where the user does not provide an email value
  when making a request to change a user's information. By setting the `email` property to `undefined`, the code ensures
  that the `email` value will not be updated in the database. */
  if (body.email.length === 0) {
    body.email = undefined;
  }

  /* The line `if (body.role.length === 0) {` is checking if the length of the `role` property in the `body` object is
  equal to 0. If the length is 0, it means that the `role` property is an empty string. In this case, the code sets the
  `role` property to `undefined`. This is likely done to handle the case where the user does not provide a role value
  when making a request to change a user's information. By setting the `role` property to `undefined`, the code ensures
  that the `role` value will not be updated in the database. */
  if (body.role.length === 0) {
    body.role = undefined;
  }

  //If user attempts to change a role from Admin to non-Admin, then the change will be denied.
  if (userToBeChanged.role === 'ADMIN' && body.role !== 'ADMIN') {
    return res.status(403).end();
  }
  //if any parameter is undefined/null then prisma will not change it
  await prisma.user.update({
    where: {
      id: body.id
    },
    data: {
      name: body.name,
      email: body.email,
      role: body.role
    }
  });

  /* The line `return res.status(200).end();` is sending a response with a status code of 200 (OK) and ending the response.
  This indicates that the request was successful and there is no additional data to be sent in the response body. */
  return res.status(200).end();
}
