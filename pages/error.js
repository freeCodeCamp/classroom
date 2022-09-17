import Navbar from '../components/navbar';
export default function error() {
  return (
    <>
      <Navbar></Navbar>

      <h1 className='text-[40px] text-center big-heading underline'>
        Access Denied
      </h1>
      <p className='text-center'>
        Please contact your administrator if you believe this is incorrect.
      </p>
    </>
  );
}
