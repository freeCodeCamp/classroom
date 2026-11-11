import { useState } from 'react';
import { useRouter } from 'next/router';
import { ControlLabel, HelpBlock } from '@freecodecamp/ui';
import FormSelect from './helpers/form-select';
import type React from 'react';
import DisplayNotification from './displayNotification';
import { JOIN_MODE_OPTIONS, isJoinMode } from '../util/joinModes';
import type { JoinMode } from '../util/joinModes';

type JoinModeControlProps = {
  classroomId: string;
  joinMode: JoinMode;
};

/**
 * Lets the teacher choose who can join the class through its invite link.
 * Saves as soon as the choice changes, then reloads the page data so the
 * join requests list matches the new mode.
 */
export default function JoinModeControl({
  classroomId,
  joinMode
}: JoinModeControlProps): React.JSX.Element {
  const router = useRouter();
  const [value, setValue] = useState<JoinMode>(joinMode);
  const [isSaving, setIsSaving] = useState(false);

  const current = JOIN_MODE_OPTIONS.find(option => option.value === value);

  const changeMode = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ): Promise<void> => {
    const next = event.target.value;
    if (!isJoinMode(next) || next === value) return;
    const previous = value;
    setValue(next);
    setIsSaving(true);
    try {
      const res = await fetch('/api/editclass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroomId, joinMode: next })
      });
      if (!res.ok) {
        setValue(previous);
        DisplayNotification('Error', 'Could not change who can join.');
        return;
      }
      const label = JOIN_MODE_OPTIONS.find(o => o.value === next)?.label;
      DisplayNotification('Success', `Joining is now set to ${label}.`);
      await router.replace(router.asPath, undefined, { scroll: false });
    } catch (error) {
      setValue(previous);
      DisplayNotification('Error', 'Could not change who can join.');
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='mt-4'>
      <ControlLabel htmlFor='class-join-mode'>Who can join</ControlLabel>
      <div className='max-w-xs mt-1'>
        <FormSelect
          id='class-join-mode'
          value={value}
          onChange={changeMode}
          disabled={isSaving}
          aria-describedby='class-join-mode-help'
        >
          {JOIN_MODE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      </div>
      <HelpBlock id='class-join-mode-help'>{current?.description}</HelpBlock>
    </div>
  );
}
