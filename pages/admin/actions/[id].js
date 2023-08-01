/**
 * This is a Next.js page component that fetches user information from a database and renders a form to update the user's
 * details.
 * @param context - The `context` parameter is an object that contains information about the current request and response.
 * It is passed to the `getServerSideProps` function as an argument.
 * @returns The code is returning a Next.js page component called "Actions". This component includes a Navbar component and
 * an UpdateUserForm component. The "userInfo" prop is passed to the UpdateUserForm component.
 */

/* The line `import { getSession } from 'next-auth/react';` is importing the `getSession` function from the
`next-auth/react` package. This function is used to retrieve the session information of the currently logged-in user. In
this code, it is used to check if a user is logged in before proceeding with the server-side logic. */
import { getSession } from 'next-auth/react';
import Navbar from '../../../components/navbar';
import UpdateUserForm from '../../../components/updateUserForm';
import prisma from '../../../prisma/prisma';

/**
 * This function is an example of a server-side function in JavaScript that checks if a user is logged in and has the
 * role of an admin, and then retrieves user information based on a given ID.
 * @param context - The `context` parameter is an object that contains information about the current request and response.
 * It is typically provided by the Next.js framework.
 * @returns an object with a `props` property. The `props` property contains an object with a `userInfo` property, which
 * holds the information of a user.
 */
export async function getServerSideProps(context) {
  const userSession = await getSession(context);
  if (!userSession) {
    /* The line `context.res.writeHead(302, { Location: '/' });` is setting the HTTP status code to 302 (Found/Redirect)
    and specifying the location to redirect to as '/'. This is used to redirect the user to the homepage if they are not
    logged in. */
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
    return {};
  }

  /* The code is using Prisma, an Object-Relational Mapping (ORM) tool, to query the database and find a unique user based
  on their email. It is retrieving the user's email and role from the database. */
  const user = await prisma.User.findUnique({
    where: {
      email: userSession['user']['email']
    },
    select: {
      email: true,
      role: true
    }
  });

  /* The line `if (user.role != 'ADMIN') {` is checking if the role of the user retrieved from the database is not equal to
  'ADMIN'. If the user's role is not 'ADMIN', it means they do not have the necessary permissions to access the page,
  and the code redirects them to the '/error' page. */
  if (user.role != 'ADMIN') {
    context.res.writeHead(302, { Location: '/error' });
    context.res.end();
    return {};
  }

  /* The code `const userInfo = await prisma.User.findUnique({ ... })` is using Prisma to query the database and retrieve
  information about a specific user.  https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findunique*/
  const userInfo = await prisma.User.findUnique({
    where: {
      id: context.params.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  return {
    props: {
      userInfo: userInfo
    }
  };
}

/**
 * The Actions function renders a Navbar component and an UpdateUserForm component, passing the userInfo prop to the
 * UpdateUserForm component.
 * @returns The Actions component is returning a fragment containing a Navbar component and an UpdateUserForm component.
 */
export default function Actions({ userInfo }) {
  return (
    <>
      <Navbar></Navbar>
      <UpdateUserForm userInfo={userInfo}></UpdateUserForm>
    </>
  );
}
