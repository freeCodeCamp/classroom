import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import OrgTypeOnboardingCombobox from './onboarding/onboardingCombobox';
// TODO: Add Backend logic to create the organization on classroom's backend
export default function OrgOnboardingModal({
  selectedOrg,
  toggleModalFromChild
}) {
  const [isOpen, setIsOpen] = useState(true);

  const [onboardPage, setOnboardPage] = useState(1);

  const [onboardingData, setOnboardingData] = useState({
    organizationName: '',
    primaryUserEmail: '',
    primaryUserFullName: '',
    organizationType: ''
  });

  const setModalFromChild = () => {
    setIsOpen(false);
    toggleModalFromChild();
  };

  const handleDataChange = (e, { name, value }) => {
    setOnboardPage(onboardPage + 1);
    setOnboardingData((onboardingData[name] = value));
  };

  const handleSubmitData = e => {
    e.preventDefault();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        as='div'
        className='relative z-10'
        onClose={setModalFromChild}
      >
        <div className='fixed inset-0 bg-black bg-opacity-25' />
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
              <Dialog.Title
                as='h3'
                className='text-lg font-medium leading-6 text-gray-900'
              >
                Welcome! Please fill out this information to get started with
                Classroom Mode!
              </Dialog.Title>
              <div className='mt-2'>
                <label>
                  Organization name:
                  <input
                    required
                    name='organizationName'
                    placeholder={`ACME State University`}
                    className='w-full'
                    onChange={() => handleDataChange}
                  ></input>
                </label>
                <label>
                  Full Name:
                  <input
                    required
                    name='primaryUserFullName'
                    placeholder='John Acme'
                    className='w-full'
                    onChange={() => handleDataChange}
                  ></input>
                </label>
                <label>
                  Email:
                  <input
                    required
                    name='primaryUserEmail'
                    placeholder='dean@acme.edu'
                    className='w-full'
                    onChange={() => handleDataChange}
                  ></input>
                </label>
                <OrgTypeOnboardingCombobox
                  selectedOrg={selectedOrg}
                ></OrgTypeOnboardingCombobox>
              </div>

              <div className='flex mt-4 justify-between'>
                <button
                  type='button'
                  className='inline-flex justify-center rounded-md border border-transparent bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                  onClick={setModalFromChild}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                  onClick={() => handleSubmitData}
                >
                  Submit
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
