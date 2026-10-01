import { Button, ControlLabel, FormControl, FormGroup } from '@freecodecamp/ui';
import FormSelect from './helpers/form-select';
import DisplayNotification from './displayNotification';
import { useRouter } from 'next/router';

export default function UpdateUserForm(props) {
  const router = useRouter();
  const previousRole = props.userInfo.role;
  const handleSubmit = async event => {
    event.preventDefault();

    const data = {
      id: props.userInfo.id,
      name: event.target.name.value,
      email: event.target.email.value,
      role: event.target.role.value
    };
    const JSONdata = JSON.stringify(data);

    const endpoint = `/api/modifyuser`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    };

    // Only leave the form once the update worked, so a failure isn't hidden.
    try {
      const res = await fetch(endpoint, options);
      if (!res.ok) {
        DisplayNotification('Error', 'The user could not be updated.');
        return;
      }
      DisplayNotification('Success', 'User updated');
      router.push('/admin');
    } catch (error) {
      DisplayNotification(
        'Error',
        'Sorry, there was an error on our end. Please try again later.'
      );
      console.log(error);
    }
  };
  const currRole = props.userInfo.role;
  let roles = ['ADMIN', 'STUDENT', 'TEACHER', 'NONE'];
  // If ADMIN, no other roles are shown
  if (previousRole === 'ADMIN') {
    roles = ['ADMIN'];
  }
  const x = roles.indexOf(currRole);
  const temp = roles[x];
  roles[x] = roles[0];
  roles[0] = temp;

  return (
    <main className='max-w-2xl mx-auto px-4 py-16'>
      <h1 className='big-heading text-center'>Edit User</h1>
      <p className='text-center'>
        You are currently editing: {props.userInfo.name} ({props.userInfo.email}
        )
      </p>
      <p className='text-center'>Leave a field blank to keep its value.</p>
      <form onSubmit={handleSubmit}>
        {/* pass teacher ID to API but hide it from user */}
        <input type='hidden' name='id' value={props.userInfo.id} readOnly />

        <FormGroup controlId='name'>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type='text'
            name='name'
            placeholder={props.userInfo.name}
          />
        </FormGroup>
        <FormGroup controlId='email'>
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type='email'
            name='email'
            placeholder={props.userInfo.email}
          />
        </FormGroup>
        <FormGroup controlId='role'>
          <ControlLabel>Role</ControlLabel>
          <FormSelect id='role' name='role'>
            {roles.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </FormSelect>
        </FormGroup>
        <Button type='submit' block className='btn-cta'>
          Submit
        </Button>
      </form>
    </main>
  );
}
