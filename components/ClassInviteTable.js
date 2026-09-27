import ButtonLink from './helpers/button-link';
import { useState } from 'react';
import { Dropdown, MenuItem, Panel } from '@freecodecamp/ui';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClassModal from './ClassModal';

export default function ClassInviteTable({
  currentClass,
  certificationNames,
  userId,
  handleDelete,
  handleEdit
}) {
  const router = useRouter();
  const [editOn, setEditOn] = useState(false);

  const getSelectedCerts = () =>
    certificationNames.filter(cert =>
      currentClass.fccCertifications.includes(cert.value)
    );

  const copy = async () => {
    //Add the full URL to send to student
    await navigator.clipboard.writeText(
      `${window.location.origin}/join/${currentClass.classroomId}`
    );

    toast('Class code successfully copied', {
      className: 'toast-message'
    });
  };

  const deleteClass = async () => {
    if (confirm('Do you want to delete this class?') == true) {
      const JSONdata = JSON.stringify(currentClass.classroomId);
      const classToDelete = currentClass.classroomId;
      try {
        const res = await fetch(`/api/deleteclass`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSONdata
        });
        if (res.status === 403) {
          alert('Cannot delete class, not valid user');
        } else {
          handleDelete(classToDelete);
          alert('Class successfully deleted.');
        }
      } catch (error) {
        alert('Sorry, there was an error on our end. Please try again later.');
        console.log(error);
      }
    }
  };

  const saveEdit = async payload => {
    const JSONdata = JSON.stringify(payload);
    try {
      const res = await fetch(`/api/editclass`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSONdata
      });
      if (res.status === 304) {
        router.reload('/classes');
        alert('No changes modified.');
      } else {
        const jsonRes = await res.json();
        const updatedClassroom = {
          classroomName: jsonRes.classroomName,
          description: jsonRes.description,
          fccCertifications: jsonRes.fccCertifications
        };
        handleEdit(currentClass.classroomId, updatedClassroom);
        alert('Successfully Edited Class');
      }
    } catch (error) {
      alert('Sorry, there was an error on our end. Please try again later.');
      console.log(error);
    }
  };

  const clickedEdit = () => {
    setEditOn(true);
  };

  const closeEditModal = () => {
    setEditOn(false);
  };

  const selectedCerts = getSelectedCerts();
  const menuId = `class-actions-${currentClass.classroomId}`;
  const certsId = `class-certs-${currentClass.classroomId}`;

  return (
    <div className='px-4'>
      <Panel className='max-w-xl mx-auto mt-6'>
        <Panel.Heading className='flex flex-wrap items-center gap-2'>
          <div className='min-w-0 w-full sm:w-auto sm:flex-1'>
            <Panel.Title>
              <span className='break-words line-clamp-2'>
                {currentClass.classroomName}
              </span>
            </Panel.Title>
          </div>

          <div className='ml-auto flex items-center gap-2'>
            {/* Certification list. Not covered by @freecodecamp/ui, so it's a
              small popover styled like the library's Dropdown menu. It opens
              on hover and on keyboard focus. */}
            <div className='relative shrink-0 group/certs'>
              <button
                type='button'
                className='flex items-center p-1 text-foreground-secondary bg-transparent border-0 cursor-help'
                aria-label='Show certifications in this class'
                aria-describedby={certsId}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth='2'
                  aria-hidden='true'
                >
                  <circle cx='12' cy='12' r='10' />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 16v-4m0-4h.01'
                  />
                </svg>
              </button>
              <div
                id={certsId}
                role='tooltip'
                className='hidden group-hover/certs:block group-focus-within/certs:block absolute right-0 top-full mt-1 z-10 w-64 max-h-64 overflow-y-auto p-3 text-left text-sm bg-background-primary text-foreground-primary border-1 border-solid border-foreground-primary'
              >
                <p className='font-bold mb-1'>Certifications</p>
                {selectedCerts.length > 0 ? (
                  <ul className='list-disc pl-5 m-0'>
                    {selectedCerts.map(cert => (
                      <li key={cert.value} className='break-words'>
                        {cert.displayName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='m-0'>No certifications assigned</p>
                )}
              </div>
            </div>

            <Dropdown>
              <Dropdown.Toggle id={menuId} className='shrink-0'>
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu className='right-0'>
                <MenuItem onClick={clickedEdit}>Edit</MenuItem>
                <MenuItem onClick={copy}>Copy invite link</MenuItem>
                <MenuItem onClick={deleteClass}>Delete</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Panel.Heading>

        <Panel.Body>
          <p
            className='break-words line-clamp-4'
            title={currentClass.description}
          >
            {currentClass.description}
          </p>
          <ButtonLink href={`/dashboard/v2/${currentClass.classroomId}`}>
            View Class
          </ButtonLink>
        </Panel.Body>
      </Panel>

      <ClassModal
        mode='edit'
        isOpen={editOn}
        onClose={closeEditModal}
        userId={userId}
        certificationNames={certificationNames}
        initialValues={{
          classroomId: currentClass.classroomId,
          classroomName: currentClass.classroomName,
          description: currentClass.description,
          fccCertifications: currentClass.fccCertifications
        }}
        onSubmit={saveEdit}
      />
    </div>
  );
}
