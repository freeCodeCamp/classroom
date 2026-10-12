import type React from 'react';
import Navbar from './navbar';

type ErrorComponentProps = {
  errorCause: string;
  errorMessage: string;
};

export default function ErrorComponent(
  props: ErrorComponentProps
): React.JSX.Element {
  return (
    <>
      <Navbar></Navbar>

      <main className='max-w-2xl mx-auto px-4 py-16 text-center'>
        <h1 className='big-heading'>{props.errorCause}</h1>
        <p>{props.errorMessage}</p>
      </main>
    </>
  );
}
