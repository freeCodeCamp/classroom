import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@freecodecamp/ui';
import FloatingMultiSelect from './FloatingMultiSelect';
import { getStoredSuperblocks } from '../util/curriculum/constants';

/**
 * Shared Create/Edit Class modal.
 *
 * Used by both the "Create Class" trigger (components/modal.js) and the
 * "Edit" menu item (components/ClassInviteTable.js) so the two flows share
 * one implementation instead of two hand-copied ones.
 *
 * Renders via a portal straight to document.body so the overlay/panel are
 * never subject to layout quirks from wherever the trigger happens to sit
 * in the component tree.
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  if (!isOpen || !mounted) {
    return null;
  }

  return createPortal(
    <div className='bg-zinc-200 opacity-100 fixed inset-0 z-50'>
      <div className='flex h-screen justify-center items-center'>
        <div className='flex-col justify-center bg-fcc-gray-90 py-12 px-24 border-4 border-sky-500 rounded-xl overflow-auto max-h-screen'>
          <div className='flex text-lg text-white justify-center items-center'>
            {isEdit ? 'Edit Class' : 'Create Class'}
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <input type='hidden' name='remember' value='true'></input>
            <div className='rounded-md shadow-sm -space-y-px'>
              <div>
                <p className='text-white mb-1'>
                  {isEdit ? 'Edit Class Name:' : 'Class Name:'}
                </p>
                <label htmlFor='class-name' className='sr-only'>
                  Class Name
                </label>
                <input
                  onChange={e => setClassName(e.target.value)}
                  value={className}
                  id='class-name'
                  name='classname'
                  required
                  maxLength={100}
                  className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                  placeholder='Class Name'
                ></input>
                <p className='text-xs text-gray-300 text-right mt-1'>
                  {className.length}/100
                </p>
              </div>
            </div>
            <div className='rounded-md shadow-sm -space-y-px'>
              <div>
                <p className='text-white mb-1'>
                  {isEdit ? 'Edit Description:' : 'Description:'}
                </p>
                <label htmlFor='description-text' className='sr-only'>
                  Description
                </label>
                <textarea
                  onChange={e => setDescription(e.target.value)}
                  value={description}
                  id='description-text'
                  name='description'
                  required
                  maxLength={500}
                  className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                  placeholder='Description'
                ></textarea>
                <p className='text-xs text-gray-300 text-right mt-1'>
                  {description.length}/500
                </p>
              </div>
            </div>
            <div className='rounded-md shadow-sm -space-y-px w-60 lg:w-72 2xl:w-96'>
              <div>
                <p className='text-white mb-1'>
                  {isEdit
                    ? 'Edit Select Certifications:'
                    : 'Select Certifications:'}
                </p>
                <FloatingMultiSelect
                  options={certificationNames.map(cert => ({
                    value: cert.value,
                    label: cert.displayName
                  }))}
                  value={selected}
                  onChange={setSelected}
                  labelledBy='Select'
                />
              </div>
            </div>

            <div className='flex items-center justify-center gap-4'>
              <Button type='submit' className='btn-cta'>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
