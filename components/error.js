import Navbar from './navbar';
export default function ErrorComponent(props) {
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
