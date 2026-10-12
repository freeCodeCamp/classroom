import '@freecodecamp/ui/dist/base.css';
// Loaded before globals.css so Classroom's toast theme overrides it.
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import type React from 'react';
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify/unstyled';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<{ session?: Session | null }>): React.JSX.Element {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      {/* The only ToastContainer: every mounted container renders each toast. */}
      <ToastContainer />
    </SessionProvider>
  );
}
