import { useState } from 'react';
import { Button } from '@freecodecamp/ui';
import ClassModal from './ClassModal';
import DisplayNotification from './displayNotification';
import type React from 'react';
import type {
  CertificationOption,
  ClassModalPayload,
  ClassroomResponse,
  ClassroomSummary
} from '../types/classroom';

type ModalProps = {
  userId: string;
  certificationNames: CertificationOption[];
  setCurrentClassrooms: React.Dispatch<
    React.SetStateAction<ClassroomSummary[]>
  >;
};

export default function Modal({
  userId,
  certificationNames,
  setCurrentClassrooms
}: ModalProps): React.JSX.Element {
  const [modalOn, setModalOn] = useState(false);

  const clicked = () => {
    setModalOn(true);
  };
  const closeModal = () => {
    setModalOn(false);
  };

  // Returns true on success so ClassModal knows whether to close.
  const createClass = async (payload: ClassModalPayload): Promise<boolean> => {
    try {
      const response = await fetch(`/api/create_class_teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        DisplayNotification('Error', 'Class could not be created!');
        return false;
      }

      const jsonRes = (await response.json()) as ClassroomResponse;
      const newClassroom = {
        classroomName: jsonRes.classroomName,
        description: jsonRes.description,
        classroomTeacherId: jsonRes.classroomTeacherId,
        fccCertifications: jsonRes.fccCertifications,
        classroomId: jsonRes.classroomId,
        createdAt: jsonRes.createdAt
      };
      setCurrentClassrooms(currentClassrooms => [
        ...currentClassrooms,
        newClassroom
      ]);
      DisplayNotification('Success', 'Class Created!');
      return true;
    } catch (error) {
      DisplayNotification('Error', 'Class could not be created!');
      console.log(error);
      return false;
    }
  };

  return (
    <>
      <div>
        <div className='flex justify-center'>
          <Button size='large' className='btn-cta m-6' onClick={clicked}>
            Create Class
          </Button>
        </div>
        <ClassModal
          mode='create'
          isOpen={modalOn}
          onClose={closeModal}
          userId={userId}
          certificationNames={certificationNames}
          onSubmit={createClass}
        />
      </div>
    </>
  );
}
