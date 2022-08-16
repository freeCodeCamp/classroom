import Navbar from './navbar';
export default function ErrorComponent(props) {
  return (
    <>
      <Navbar></Navbar>

      <h1 className='text-[40px] text-center big-heading underline'>
        {props.errorCause}
      </h1>
      <p className='text-center'>{props.errorMessage}</p>
    </>
  );
}
