import { useState } from 'react';
import { Combobox } from '@headlessui/react';

const orgTypes = [
  { id: 1, name: 'University' },
  { id: 2, name: 'Community College' },
  { id: 3, name: 'Coding Bootcamp' },
  { id: 4, name: 'High School (or equivalent)' },
  { id: 5, name: 'Other' }
];
// Combobox comes from headlessUI
export default function OrgTypeOnboardingCombobox(props) {
  let presetOrg;
  if (props.selectedOrg == undefined) {
    presetOrg = 0;
  } else {
    presetOrg = props.selectedOrg;
  }
  const [selected, setSelected] = useState(orgTypes[presetOrg]);
  const [query, setQuery] = useState('');

  const filteredOrgs =
    query === ''
      ? orgTypes
      : orgTypes.filter(org =>
          org.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div className='w-full h-fill mt-2'>
      <Combobox value={selected} name='organizationType' onChange={setSelected}>
        <div className='relative mt-1'>
          <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
            <Combobox.Label>Organization Type:</Combobox.Label>
            <Combobox.Input
              className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
              displayValue={org => org.name}
              onChange={event => setQuery(event.target.value)}
            />
            <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19.5 8.25l-7.5 7.5-7.5-7.5'
                />
              </svg>
            </Combobox.Button>
          </div>
          <Combobox.Options className='mt-1 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
            {filteredOrgs.length === 0 && query !== '' ? (
              <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                Nothing found.
              </div>
            ) : (
              filteredOrgs.map(org => (
                <Combobox.Option
                  key={org.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-fcc-secondary-darkBlue text-white'
                        : 'text-gray-900'
                    }`
                  }
                  value={org}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {org.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-teal-600'
                          }`}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                            className='w-6 h-6'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M4.5 12.75l6 6 9-13.5'
                            />{' '}
                          </svg>
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
      {selected.id == 5 ? (
        <label>
          Please specify:
          <input
            className='w-full'
            required
            name='otherType'
            placeholder='After School Program'
          ></input>
        </label>
      ) : null}
    </div>
  );
}
