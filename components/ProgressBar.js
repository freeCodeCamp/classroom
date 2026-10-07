/**
 * Mirrors freeCodeCamp's progress bar (client/src/components/Progress and
 * completion-modal.css): a 10px track in the quaternary background with a
 * 1px border, filled with the primary color. @freecodecamp/ui has no
 * progress component.
 */
export default function ProgressBar({ value, max, label }) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className='flex items-center gap-2'>
      <span className='whitespace-nowrap'>
        {value}/{max}
      </span>
      <div
        role='progressbar'
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className='relative flex-1 min-w-[80px] h-[12px] border-1 border-solid border-foreground-quaternary bg-background-quaternary'
      >
        <div
          className='h-full bg-foreground-primary'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
