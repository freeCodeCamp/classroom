// json-server loads this file instead of fccdata.json. It serves the same
// data, with the completion dates moved into the last few months, so the
// activity chart on the student details page shows recent activity.
// json-server loads it with require(), so it is CommonJS (see package.json).
/* oxlint-disable typescript/no-require-imports */
const fs = require('fs');
const path = require('path');

const DAY_MS = 24 * 60 * 60 * 1000;
// The first completion is this many days ago, and each next one is
// DAYS_BETWEEN days later.
const FIRST_DAYS_AGO = 90;
const DAYS_BETWEEN = 10;

const shiftCompletedDates = (value, state) => {
  if (Array.isArray(value)) {
    value.forEach(item => shiftCompletedDates(item, state));
  } else if (value && typeof value === 'object') {
    if (typeof value.completedDate === 'number') {
      const daysAgo = Math.max(FIRST_DAYS_AGO - state.count * DAYS_BETWEEN, 1);
      value.completedDate = state.now - daysAgo * DAY_MS;
      state.count += 1;
    }
    Object.values(value).forEach(item => shiftCompletedDates(item, state));
  }
};

module.exports = () => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'fccdata.json'), 'utf8')
  );
  shiftCompletedDates(data, { now: Date.now(), count: 0 });
  return data;
};
