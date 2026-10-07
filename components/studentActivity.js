const ONE_WEEK_MS = 604800000;

/**
 * A student is "Active" if they completed at least one challenge in the past
 * week. @freecodecamp/ui has no status badge, so this is a colored dot (fCC
 * palette) plus a text label, so the status doesn't rely on color alone.
 */
export default function getStudentActivity(props) {
  const now = new Date().getTime();
  let isActive = false;
  let mostRecentCompletionTime = 0;

  props.recentCompletions.forEach(completionTime => {
    if (now - completionTime < ONE_WEEK_MS) {
      isActive = true;
    }
    if (completionTime > mostRecentCompletionTime) {
      mostRecentCompletionTime = completionTime;
    }
  });

  const lastCompletionText =
    mostRecentCompletionTime === 0
      ? 'No completions yet'
      : 'Last completion time: ' +
        new Date(mostRecentCompletionTime).toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles'
        });

  return (
    <span className='inline-flex items-center gap-2' title={lastCompletionText}>
      <span
        aria-hidden='true'
        className={`inline-block h-3 w-3 rounded-full ${
          isActive ? 'bg-green-700' : 'bg-red-700'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
