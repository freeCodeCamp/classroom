import type { Redirect } from 'next';

/*
 * Function to redirect user, within getServerSideProps functions.
 * Leaving it blank will error out
 * @param  {string}    arg1 The intended link to access. examples: '/error', '/admin', '/class', '/'.
 * @return {[type]}    HTTP request to redirected link
 */

const redirectUser = (destination: string): { redirect: Redirect } => {
  return {
    redirect: {
      destination: destination,
      permanent: false
    }
  };
};

export default redirectUser;
