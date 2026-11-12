import { Button, Modal, Spacer } from '@freecodecamp/ui';
import type React from 'react';

type RemoveStudentModalProps = {
  studentEmail: string | null;
  classroomName: string;
  isRemoving: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Confirms removing a student, in the style of the delete-class dialog. */
export default function RemoveStudentModal({
  studentEmail,
  classroomName,
  isRemoving,
  onConfirm,
  onClose
}: RemoveStudentModalProps): React.JSX.Element {
  return (
    <Modal open={studentEmail !== null} onClose={onClose} variant='danger'>
      <Modal.Header>Remove student?</Modal.Header>
      <Modal.Body>
        <p className='wrap-break-word'>
          Remove <strong>{studentEmail}</strong> from{' '}
          <strong>{classroomName}</strong>?
        </p>
        <p className='m-0'>
          If the class is Open, they can rejoin with the invite link, so set it
          to Ask to join or Closed first if you don&apos;t want them back.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          block
          variant='danger'
          onClick={onConfirm}
          disabled={isRemoving}
        >
          Remove student
        </Button>
        <Spacer size='xs' />
        <Button block onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
