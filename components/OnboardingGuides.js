import { Panel } from '@freecodecamp/ui';
import ButtonLink from './helpers/button-link';
import Link from './helpers/link';

const Steps = ({ steps }) => (
  <ol className='list-decimal pl-6 m-0 space-y-4'>
    {steps.map(step => (
      <li key={step.title} className='pl-1'>
        <h3 className='mb-1'>{step.title}</h3>
        <div className='[&>p]:mb-2'>{step.body}</div>
      </li>
    ))}
  </ol>
);

export function TeacherGuide({ isTeacher }) {
  const steps = [
    {
      title: 'Get teacher access',
      body: (
        <p>
          Accept the teacher invitation your Classroom admin emailed you, or ask
          them to give your account teacher access.
        </p>
      )
    },
    {
      title: 'Sign in',
      body: <p>Sign in with the email address your admin used.</p>
    },
    {
      title: 'Create a class',
      body: (
        <>
          <p>
            On the Classes page, select <strong>Create Class</strong>, give it a
            name and description, and choose the certifications your students
            will work on.
          </p>
          {isTeacher && (
            <ButtonLink href='/classes'>Go to your classes</ButtonLink>
          )}
        </>
      )
    },
    {
      title: 'Invite your students',
      body: (
        <p>
          Open the class&apos;s <strong>Actions</strong> menu, select{' '}
          <strong>Copy invite link</strong>, and share the link with your
          students.
        </p>
      )
    },
    {
      title: 'Track their progress',
      body: (
        <p>
          Select <strong>View Class</strong> to see each student&apos;s activity
          and progress, then open a student&apos;s <strong>details</strong> for
          block-by-block progress.
        </p>
      )
    }
  ];

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title>Teaching with Classroom</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Steps steps={steps} />
      </Panel.Body>
    </Panel>
  );
}

export function StudentGuide() {
  const steps = [
    {
      title: 'Have a freeCodeCamp account',
      body: (
        <p>
          If you don&apos;t have one yet, create a free account on{' '}
          <Link to='https://www.freecodecamp.org/' external>
            freeCodeCamp.org
          </Link>
          .
        </p>
      )
    },
    {
      title: 'Turn on Classroom access',
      body: (
        <p>
          In your{' '}
          <Link to='https://www.freecodecamp.org/settings' external>
            freeCodeCamp settings
          </Link>
          , enable Classroom access so your teacher can see your progress.
        </p>
      )
    },
    {
      title: "Open your class's join link",
      body: (
        <p>
          Your teacher will share a link to your class. It looks like{' '}
          <code>/join/&lt;class id&gt;</code>.
        </p>
      )
    },
    {
      title: 'Sign in and connect',
      body: (
        <p>
          Sign in with the same email address as your freeCodeCamp account, then
          select <strong>Connect to Classroom</strong>.
        </p>
      )
    }
  ];

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title>Joining a class</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Steps steps={steps} />
      </Panel.Body>
    </Panel>
  );
}
