export default function getActivityStatus(props) {
  const thresholdTime = 604800000; // time of one week in milliseconds
  let today = Math.floor(new Date().getTime());
  let recentCompletionCount = 0;
  let mostRecentCompletionTime = 0;

  for (let i = 0; i < props.recentCompletions.length; i++) {
    let period = today - props.recentCompletions[i];
    if (period < thresholdTime) {
      recentCompletionCount++;
    }
    if (mostRecentCompletionTime < props.recentCompletions[i]) {
      mostRecentCompletionTime = props.recentCompletions[i];
    }
  }
  var mostRecentDate = new Date(mostRecentCompletionTime);
  let mostRecentDateText =
    'Last completion time: ' + mostRecentDate.toLocaleString();

  return (
    <div
      className={`${
        recentCompletionCount >= 2
          ? 'bg-green-600 h-5 w-5'
          : recentCompletionCount === 0
          ? 'bg-red-600 h-5 w-5'
          : 'bg-yellow-300 h-5 w-5'
      }`}
      style={{ margin: 'auto' }}
      title={mostRecentDateText}
    ></div>
  );
}
