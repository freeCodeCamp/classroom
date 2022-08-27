import { useState } from 'react';

export default function UpdateTeacherForm(props) {
  const [isChecked, setIsChecked] = useState(props.teacherInfo.isAdminApproved);
  const handleVerificationChange = () => {
    setIsChecked(!isChecked);
  };
  const handleSubmit = async event => {
    event.preventDefault();

    const data = {
      id: props.teacherInfo.id,
      name:
        event.target.name.value.length == 0
          ? props.teacherInfo.name
          : event.target.name.value,
      email:
        event.target.email.value == 0
          ? props.teacherInfo.email
          : event.target.email.value,
      isAdminApproved: event.target.verified.checked
    };
    const JSONdata = JSON.stringify(data);

    const endpoint = `/api/updateTeacher/` + props.teacherInfo.id;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    };

    const res = await fetch(endpoint, options);
    console.log(res);
  };
  return (
    <div className='flex flex-col items-center justify-center'>
      <p className='my-4'>
        You are currently editing: {props.teacherInfo.name} (
        {props.teacherInfo.email})
      </p>
      <form
        className='bg-slate-200 p-8 rounded border border-black'
        onSubmit={handleSubmit}
      >
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label htmlFor='name'>Name:</label>
            <input
              type='text'
              id='name'
              name='name'
              className='bg-slate-200'
              placeholder={props.teacherInfo.name}
            />
          </div>
        </div>
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0 border border-black'>
            <label htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              name='email'
              className='bg-slate-200'
              placeholder={props.teacherInfo.email}
            />
          </div>
        </div>
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label htmlFor='verified'>Verified: </label>
            <input
              type='checkbox'
              id='verified'
              name='verified'
              checked={isChecked}
              onChange={handleVerificationChange}
            />
          </div>
        </div>
        <button
          className='text-white flex-shrink-0 border-transparent border-4 bg-[#0a0a23] hover:text-gray-200 text-sm py-1 px-2 rounded'
          type='submit'
        >
          Submit
        </button>
      </form>
    </div>
  );
}
