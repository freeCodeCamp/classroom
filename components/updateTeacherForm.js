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
    <form onSubmit={handleSubmit}>
      <label htmlFor='name'>Name:</label>
      <input
        type='text'
        id='name'
        name='name'
        placeholder={props.teacherInfo.name}
      />
      <label htmlFor='email'>Email:</label>
      <input
        type='email'
        id='email'
        name='email'
        placeholder={props.teacherInfo.email}
      />
      <label htmlFor='verified'>Verified</label>
      <input
        type='checkbox'
        id='verified'
        name='verified'
        checked={isChecked}
        onChange={handleVerificationChange}
      ></input>
      <button type='submit'>Submit</button>
    </form>
  );
}
