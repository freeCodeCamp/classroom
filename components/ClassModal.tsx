import { useState, useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Modal,
  Spacer
} from '@freecodecamp/ui';
import type { Option } from 'react-multi-select-component';
import type React from 'react';
import { getStoredSuperblocks } from '../util/curriculum/constants';
import type {
  CertificationOption,
  ClassModalPayload,
  ClassroomEditValues,
  ClassroomFormFields
} from '../types/classroom';
import {
  CLASS_NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH
} from '../util/classroomValidation';

type ClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  certificationNames: CertificationOption[];
  onSubmit: (payload: ClassModalPayload) => Promise<boolean>;
} & (
  | { mode: 'create'; initialValues?: undefined }
  | { mode: 'edit'; initialValues: ClassroomEditValues }
);

/**
 * Shared Create/Edit Class modal.
 *
 * Used by both the "Create Class" trigger (components/modal.tsx) and the
 * "Edit" menu item (components/ClassInviteTable.tsx) so the two flows share
 * one implementation instead of two hand-copied ones.
 *
 * Built on @freecodecamp/ui's Modal (a Headless UI Dialog), which renders in
 * its own portal over the whole page, traps focus, and closes on Escape or a
 * click on the backdrop. The certification dropdown renders inline: the modal
 * panel doesn't clip overflow (its full-screen container scrolls instead), and
 * a dropdown portaled outside the panel would count as an "outside" click.
 */
const sameItems = (a: string[] = [], b: string[] = []): boolean => {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return (
    sortedA.length === sortedB.length &&
    sortedA.every((item, i) => item === sortedB[i])
  );
};

// The API trims the name and description before saving them, so only a
// change to the trimmed text counts. Adding a trailing space is not a change.
export const getChangedFields = (
  fields: ClassroomFormFields,
  initialValues: ClassroomFormFields
): Partial<ClassroomFormFields> => {
  const changes: Partial<ClassroomFormFields> = {};
  const name = fields.classroomName.trim();
  if (name !== initialValues.classroomName.trim()) {
    changes.classroomName = name;
  }
  const description = (fields.description ?? '').trim();
  if (description !== (initialValues.description ?? '').trim()) {
    changes.description = description;
  }
  if (!sameItems(fields.fccCertifications, initialValues.fccCertifications)) {
    changes.fccCertifications = fields.fccCertifications;
  }
  return changes;
};

export default function ClassModal({
  mode,
  isOpen,
  onClose,
  userId,
  certificationNames,
  initialValues,
  onSubmit
}: ClassModalProps): React.JSX.Element {
  const isEdit = mode === 'edit';

  const getSelectedCerts = (): Option[] => {
    if (!isEdit || !initialValues?.fccCertifications) {
      return [];
    }
    return certificationNames
      .filter(cert => initialValues.fccCertifications.includes(cert.value))
      .map(cert => ({ value: cert.value, label: cert.displayName }));
  };

  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Option[]>([]);
  const [certMenuOpen, setCertMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // `required` accepts a name made only of spaces, but the API trims it away,
  // so a blank name is flagged on submit instead.
  const [nameIsBlank, setNameIsBlank] = useState(false);

  // Re-sync local form state to the current class every time the modal
  // opens. The component instance persists across open/close (only its
  // rendered output is conditional), so this can't rely on remount to reset.
  useEffect(() => {
    if (isOpen) {
      setClassName(isEdit ? (initialValues?.classroomName ?? '') : '');
      setDescription(isEdit ? (initialValues?.description ?? '') : '');
      setSelected(getSelectedCerts());
      setNameIsBlank(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (className.trim().length === 0) {
      setNameIsBlank(true);
      return;
    }

    const fccCertificationsSet = new Set<string>();
    selected.forEach(cert =>
      getStoredSuperblocks(cert.value).forEach(req =>
        fccCertificationsSet.add(req)
      )
    );

    const fields = {
      classroomName: className.trim(),
      description: description.trim(),
      fccCertifications: [...fccCertificationsSet].sort()
    };

    // Edits only send the fields that changed, so an untouched form sends
    // nothing and the caller can report "no changes" without a request.
    const payload = isEdit
      ? {
          classroomId: initialValues.classroomId,
          ...getChangedFields(fields, initialValues)
        }
      : { ...fields, classroomTeacherId: userId };

    // onSubmit resolves to true when the save worked. On failure the modal
    // stays open with the teacher's input so they can retry; Cancel, Escape
    // and the backdrop still close it.
    setIsSubmitting(true);
    try {
      const saved = await onSubmit(payload);
      if (saved) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>{isEdit ? 'Edit Class' : 'Create Class'}</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body alignment='left'>
          <FormGroup
            controlId='class-name'
            validationState={nameIsBlank ? 'error' : null}
          >
            <ControlLabel>Class Name</ControlLabel>
            <FormControl
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setClassName(e.target.value);
                setNameIsBlank(false);
              }}
              value={className}
              name='classname'
              required
              maxLength={CLASS_NAME_MAX_LENGTH}
              aria-invalid={nameIsBlank}
              aria-describedby={nameIsBlank ? 'class-name-error' : undefined}
            />
            {nameIsBlank && (
              <HelpBlock id='class-name-error'>
                Enter a class name. Spaces alone don&apos;t count.
              </HelpBlock>
            )}
            <HelpBlock className='text-right'>
              {className.length}/{CLASS_NAME_MAX_LENGTH}
            </HelpBlock>
          </FormGroup>
          <FormGroup controlId='description-text'>
            <ControlLabel>Description (optional)</ControlLabel>
            <FormControl
              componentClass='textarea'
              rows={4}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              value={description}
              name='description'
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <HelpBlock className='text-right'>
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <ControlLabel id='certifications-label'>
              Certifications
            </ControlLabel>
            {/* react-multi-select-component treats Escape on its closed menu as
                "open", so the Modal never sees it. Close the modal instead. */}
            <div
              onKeyDownCapture={e => {
                if (e.key === 'Escape' && !certMenuOpen) {
                  e.stopPropagation();
                  onClose();
                }
              }}
            >
              <MultiSelect
                className='fcc-multi-select'
                options={certificationNames.map(cert => ({
                  value: cert.value,
                  label: cert.displayName
                }))}
                value={selected}
                onChange={setSelected}
                labelledBy='certifications-label'
                onMenuToggle={setCertMenuOpen}
              />
            </div>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type='submit'
            block
            className='btn-cta'
            disabled={isSubmitting}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Spacer size='xs' />
          <Button block onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
