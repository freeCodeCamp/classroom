import type React from 'react';

/**
 * A native <select> styled like @freecodecamp/ui's FormControl, which only
 * renders <input> and <textarea>. The classes mirror FormControl's defaults
 * (tools/ui src/form-control/form-control.tsx) plus its single-line height.
 */
const selectClasses =
  'outline-0 block w-full h-8 py-1 px-2.5 text-md text-foreground-primary bg-background-primary rounded-none border-1 border-solid border-background-quaternary shadow-none transition ease-in-out duration-150 focus:border-foreground-tertiary';

type FormSelectProps = React.ComponentPropsWithoutRef<'select'>;

export default function FormSelect({
  className,
  ...props
}: FormSelectProps): React.JSX.Element {
  return (
    <select
      className={className ? `${selectClasses} ${className}` : selectClasses}
      {...props}
    />
  );
}
