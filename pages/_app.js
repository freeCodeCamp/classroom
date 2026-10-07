import '@freecodecamp/ui/dist/base.css';
// Loaded before globals.css so Classroom's toast theme overrides it.
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      {/* The only ToastContainer: every mounted container renders each toast. */}
      <ToastContainer />
    </SessionProvider>
  );
}
