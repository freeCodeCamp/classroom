import { useRouter } from 'next/router';

export default function UpdateUserForm(props) {
  const router = useRouter();
  const handleSubmit = async event => {
    event.preventDefault();

    const data = {
      id: props.userInfo.id,
      name: event.target.name.value,
      email: event.target.email.value,
      role: event.target.role.value
    };
    const JSONdata = JSON.stringify(data);

    const endpoint = `/api/modifyuser/`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    };

    const res = await fetch(endpoint, options);
    console.log(res);
    router.push('/admin');
  };
  const currRole = props.userInfo.role;
  let roles = ['ADMIN', 'STUDENT', 'TEACHER', 'NONE'];
  const x = roles.indexOf(currRole);
  const temp = roles[x];
  roles[x] = roles[0];
  roles[0] = temp;

  return (
    <div className='flex flex-col items-center justify-center'>
      <p className='my-4'>
        You are currently editing: {props.userInfo.name} ({props.userInfo.email}
        )
      </p>
      <form
        onSubmit={handleSubmit}
        className='bg-slate-200 p-8 rounded border border-black'
      >
        {/* pass teacher ID to API but hide it from user */}
        <input
          type='text'
          name='id'
          value={props.userInfo.id}
          className='hidden'
          readOnly
        ></input>

        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label htmlFor='name'>Name:</label>
            <input
              type='text'
              id='name'
              name='name'
              className='bg-slate-200'
              placeholder={props.userInfo.name}
            />
          </div>
        </div>
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label htmlFor='email'>Email:</label>
            <input
              type='email'
              id='email'
              name='email'
              className='bg-slate-200'
              placeholder={props.userInfo.email}
            />
          </div>
        </div>
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label htmlFor='name'>Role:</label>
            <select id='role' name='role'>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
