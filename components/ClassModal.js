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
import { getStoredSuperblocks } from '../util/curriculum/constants';

export const CLASS_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Shared Create/Edit Class modal.
 *
 * Used by both the "Create Class" trigger (components/modal.js) and the
 * "Edit" menu item (components/ClassInviteTable.js) so the two flows share
 * one implementation instead of two hand-copied ones.
 *
 * Built on @freecodecamp/ui's Modal (a Headless UI Dialog), which renders in
 * its own portal over the whole page, traps focus, and closes on Escape or a
 * click on the backdrop. The certification dropdown renders inline: the modal
 * panel doesn't clip overflow (its full-screen container scrolls instead), and
 * a dropdown portaled outside the panel would count as an "outside" click.
 */
export default function ClassModal({
  mode,
  isOpen,
  onClose,
  userId,
  certificationNames,
  initialValues,
  onSubmit
}) {
  const isEdit = mode === 'edit';

  const getSelectedCerts = () => {
    if (!isEdit || !initialValues?.fccCertifications) {
      return [];
    }
    return certificationNames
      .filter(cert => initialValues.fccCertifications.includes(cert.value))
      .map(cert => ({ value: cert.value, label: cert.displayName }));
  };

  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState([]);
  const [certMenuOpen, setCertMenuOpen] = useState(false);

  // Re-sync local form state to the current class every time the modal
  // opens. The component instance persists across open/close (only its
  // rendered output is conditional), so this can't rely on remount to reset.
  useEffect(() => {
    if (isOpen) {
      setClassName(isEdit ? (initialValues?.classroomName ?? '') : '');
      setDescription(isEdit ? (initialValues?.description ?? '') : '');
      setSelected(getSelectedCerts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    const fccCertificationsSet = new Set();
    selected.forEach(cert =>
      getStoredSuperblocks(cert.value).forEach(req =>
        fccCertificationsSet.add(req)
      )
    );

    const payload = {
      classroomName: className,
      description,
      fccCertifications: [...fccCertificationsSet].sort()
    };
    if (isEdit) {
      payload.classroomId = initialValues.classroomId;
    } else {
      payload.classroomTeacherId = userId;
    }

    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>{isEdit ? 'Edit Class' : 'Create Class'}</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body alignment='left'>
          <FormGroup controlId='class-name'>
            <ControlLabel>Class Name</ControlLabel>
            <FormControl
              onChange={e => setClassName(e.target.value)}
              value={className}
              name='classname'
              required
              maxLength={CLASS_NAME_MAX_LENGTH}
            />
            <HelpBlock className='text-right'>
              {className.length}/{CLASS_NAME_MAX_LENGTH}
            </HelpBlock>
          </FormGroup>
          <FormGroup controlId='description-text'>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              componentClass='textarea'
              rows={4}
              onChange={e => setDescription(e.target.value)}
              value={description}
              name='description'
              required
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
          <Button type='submit' block className='btn-cta'>
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
