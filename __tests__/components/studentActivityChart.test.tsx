import { render, screen } from '@testing-library/react';
import StudentActivityChart, {
  buildWeeks,
  generateActivityData
} from '../../components/StudentActivityChart';

// All dates use the local time zone, like the chart, so the tests pass in any
// time zone. Thursday 12 November 2026; a year earlier is a Wednesday.
const TODAY = new Date(2026, 10, 12, 12);
const at = (month: number, day: number, year = 2026) =>
  new Date(year, month, day, 15).getTime();

describe('generateActivityData', () => {
  it('counts completions per day in the past year and ignores older ones', () => {
    const timestamps = [at(10, 10), at(10, 10), at(9, 1), at(9, 1, 2024)];

    expect(generateActivityData(timestamps, TODAY)).toEqual({
      '2026-11-10': 2,
      '2026-10-01': 1
    });
  });
});

describe('buildWeeks', () => {
  const weeks = buildWeeks({ '2026-11-10': 2 }, TODAY);
  const days = weeks.flat();
  const datedDays = days.filter(day => day.date !== null);

  it('starts one year ago, padding the first week to that weekday', () => {
    // 12 November 2025 is a Wednesday, so Sunday to Tuesday are empty.
    expect(weeks[0].slice(0, 3)).toEqual([
      { date: null, count: 0 },
      { date: null, count: 0 },
      { date: null, count: 0 }
    ]);
    expect(datedDays[0].date?.toDateString()).toBe(
      new Date(2025, 10, 12).toDateString()
    );
  });

  it('ends on today, with full weeks before the last one', () => {
    expect(datedDays.at(-1)?.date?.toDateString()).toBe(TODAY.toDateString());
    expect(weeks.slice(0, -1).every(week => week.length === 7)).toBe(true);
  });

  it('puts each day in its weekday row', () => {
    expect(
      datedDays.every(
        day => days.indexOf(day) % 7 === (day.date as Date).getDay()
      )
    ).toBe(true);
  });

  it('gives each day its completion count', () => {
    const counted = datedDays.filter(day => day.count > 0);

    expect(counted).toHaveLength(1);
    expect(counted[0].date?.toDateString()).toBe(
      new Date(2026, 10, 10).toDateString()
    );
    expect(counted[0].count).toBe(2);
  });
});

describe('StudentActivityChart', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the active days and marks them in the grid on first render', () => {
    render(
      <StudentActivityChart
        timestamps={[at(10, 10), at(10, 10), at(9, 1), at(9, 1, 2024)]}
      />
    );

    expect(
      screen.getByText('2 active days in the last year')
    ).toBeInTheDocument();
    const activeDay = screen.getByTitle(
      `${new Date(2026, 10, 10).toDateString()}: 2 completions`
    );
    expect(activeDay.getAttribute('style')).toContain(
      'var(--foreground-primary)'
    );
    const inactiveDay = screen.getByTitle(
      `${new Date(2026, 10, 11).toDateString()}: 0 completions`
    );
    expect(inactiveDay.getAttribute('style')).toContain(
      'var(--background-tertiary)'
    );
  });
});
