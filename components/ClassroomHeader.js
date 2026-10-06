import { Button, ControlLabel, FormControl, Panel } from '@freecodecamp/ui';
import DisplayNotification from './displayNotification';

/**
 * Class page header: name, description, certifications, a short summary,
 * and the invite link with a copy button (modeled on Google Classroom's class
 * banner and class code). @freecodecamp/ui has no tag/badge component, so the
 * certification tags are small bordered labels in fCC colors.
 */
export default function ClassroomHeader({
  classroomName,
  description,
  certificationTitles,
  studentCount,
  createdDate,
  joinLink
}) {
  const copyJoinLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      DisplayNotification('Success', 'Invite link copied');
    } catch {
      DisplayNotification('Error', 'Could not copy the invite link.');
    }
  };

  const studentLabel = studentCount === 1 ? 'student' : 'students';

  return (
    <header className='mb-8'>
      <h1 className='big-heading break-words'>{classroomName}</h1>
      {description && <p className='break-words'>{description}</p>}
      <p className='text-foreground-quaternary'>
        {studentCount} {studentLabel}
        {createdDate && ` · Created ${createdDate}`}
      </p>

      {certificationTitles.length > 0 && (
        <section aria-labelledby='class-certifications' className='mb-6'>
          <h2 id='class-certifications' className='text-md'>
            Certifications
          </h2>
          <ul className='flex flex-wrap gap-2 m-0 p-0 list-none'>
            {certificationTitles.map(title => (
              <li
                key={title}
                className='px-2 py-0.5 text-sm border-1 border-solid border-foreground-quaternary bg-background-secondary text-foreground-secondary'
              >
                {title}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Panel className='mb-0'>
        <Panel.Heading>
          <Panel.Title>Invite students</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <ControlLabel htmlFor='class-join-link'>
            Share this link with your students so they can join:
          </ControlLabel>
          <div className='flex flex-wrap items-center gap-2 mt-1'>
            {/* FormControl drops its own classes when given a className, so
                layout goes on a wrapper. */}
            <div className='flex-1 min-w-[220px]'>
              <FormControl
                id='class-join-link'
                type='text'
                value={joinLink}
                readOnly
                onFocus={event => event.target.select()}
              />
            </div>
            <Button className='btn-cta' onClick={copyJoinLink}>
              Copy invite link
            </Button>
          </div>
        </Panel.Body>
      </Panel>
    </header>
  );
}
