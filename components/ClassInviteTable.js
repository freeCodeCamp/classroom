import ButtonLink from './helpers/button-link';
import { useState } from 'react';
import {
  Button,
  Dropdown,
  MenuItem,
  Modal,
  Panel,
  Spacer
} from '@freecodecamp/ui';
import DisplayNotification from './displayNotification';
import ClassModal from './ClassModal';

const GENERIC_ERROR =
  'Sorry, there was an error on our end. Please try again later.';

export default function ClassInviteTable({
  currentClass,
  certificationNames,
  userId,
  handleDelete,
  handleEdit
}) {
  const [editOn, setEditOn] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);

  const getSelectedCerts = () =>
    certificationNames.filter(cert =>
      currentClass.fccCertifications.includes(cert.value)
    );

  const copy = async () => {
    // writeText rejects when the browser blocks clipboard access (an http
    // page that isn't localhost, a denied permission, or an unfocused tab).
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/join/${currentClass.classroomId}`
      );
      DisplayNotification('Success', 'Invite link copied');
    } catch {
      DisplayNotification('Error', 'Could not copy the invite link.');
    }
  };

  const deleteClass = async () => {
    setDeleteOn(false);
    const classToDelete = currentClass.classroomId;
    try {
      const res = await fetch(`/api/deleteclass`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classToDelete)
      });
      if (res.ok) {
        handleDelete(classToDelete);
        DisplayNotification('Success', 'Class deleted');
      } else if (res.status === 403) {
        DisplayNotification(
          'Error',
          'You do not have permission to delete this class.'
        );
      } else {
        DisplayNotification('Error', GENERIC_ERROR);
      }
    } catch (error) {
      DisplayNotification('Error', GENERIC_ERROR);
      console.log(error);
    }
  };

  // Returns true when the modal should close: the class was updated, or
  // there was nothing to update.
  const saveEdit = async payload => {
    const changedFields = Object.keys(payload).filter(
      key => key !== 'classroomId'
    );
    if (changedFields.length === 0) {
      DisplayNotification('Info', 'No changes were made.');
      return true;
    }
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
        DisplayNotification('Info', 'No changes were made.');
        return true;
      }
      if (!res.ok) {
        DisplayNotification('Error', GENERIC_ERROR);
        return false;
      }
      const jsonRes = await res.json();
      const updatedClassroom = {
        classroomName: jsonRes.classroomName,
        description: jsonRes.description,
        fccCertifications: jsonRes.fccCertifications
      };
      handleEdit(currentClass.classroomId, updatedClassroom);
      DisplayNotification('Success', 'Class updated');
      return true;
    } catch (error) {
      DisplayNotification('Error', GENERIC_ERROR);
      console.log(error);
      return false;
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
                <MenuItem onClick={() => setDeleteOn(true)}>Delete</MenuItem>
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

      <Modal
        open={deleteOn}
        onClose={() => setDeleteOn(false)}
        variant='danger'
      >
        <Modal.Header>Delete class?</Modal.Header>
        <Modal.Body>
          <p className='m-0 break-words'>
            Are you sure you want to delete{' '}
            <strong>{currentClass.classroomName}</strong>? This can&apos;t be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button block variant='danger' onClick={deleteClass}>
            Delete class
          </Button>
          <Spacer size='xs' />
          <Button block onClick={() => setDeleteOn(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
