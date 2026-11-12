import React, { useEffect, useRef, useState } from 'react';
import styles from './StudentActivityChart.module.css';

type Day = {
  date: Date | null;
  count: number;
};

type DatedDay = {
  date: Date;
  count: number;
};

type StudentActivityChartProps = {
  timestamps: number[];
};

// Display only Mon, Wed, Fri labels to reduce visual clutter (like GitHub)
const daysOfWeek = ['Mon', 'Wed', 'Fri'];

// Function to return all student activity in the past year into a dictionary to reference
export const generateActivityData = (
  timestamps: number[],
  today: Date
): Record<string, number> => {
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  // Creating a map of date strings to activity counts to house the chart array data
  const activityData: Record<string, number> = {};
  // Initialize all dates within the past year with normalized keys in the format YYYY-MM-DD in activity 0
  timestamps.forEach(timestamp => {
    const date = new Date(timestamp);
    if (date >= oneYearAgo) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;
      activityData[key] = (activityData[key] || 0) + 1;
    }
  });
  return activityData;
};

// Colors follow freeCodeCamp's profile heatmap (profile/components/heatmap.css):
// empty days use the tertiary background, active days the primary color.
const activityLevels = [
  'var(--background-tertiary)',
  'var(--foreground-primary)'
];

// Helper function to determine color based on activity count
const getColor = (count: number): string => {
  if (count > 0) return activityLevels[1];
  return activityLevels[0];
};

// Helper function to get the date exactly one year prior
const getPreviousYearDate = (date: Date): Date => {
  const previousYearDate = new Date(date);
  previousYearDate.setFullYear(date.getFullYear() - 1);
  return previousYearDate;
};

// Builds the chart's weeks, from one year before `today` up to and including
// `today`. Takes the date as a parameter so tests can use a fixed day.
export const buildWeeks = (
  activityData: Record<string, number>,
  today: Date
): Day[][] => {
  const startDate = getPreviousYearDate(today);

  // The day after today: the loop stops there, so today's activity is included
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 1);

  /*
  Build weeks array for the chart.
  The total weeks is 54 with the first week and last week being special
  as they may not contain a full 7 days of data.
  */
  const builtWeeks: Day[][] = [];
  const firstWeek: Day[] = [];
  const startDay = startDate.getDay();

  // Fill the first week with the correct dates
  for (let i = 0; i < startDay; i++) {
    firstWeek.push({ date: null, count: 0 });
  }

  // Initializing a check to stop adding weeks once we reach today's date
  let chart_cutoff = false;

  // If we're on the first week use the pre-filled firstWeek array otherwise we are starting fresh
  for (let i = 0; i < 54; i++) {
    let week: Day[];
    if (i === 0) {
      week = firstWeek;
    } else {
      week = [];
    }

    // If we've already reached today's date, stop adding more weeks
    if (chart_cutoff) {
      break;
    }
    // Fill in the days for the current week
    for (let j = week.length; j < 7; j++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7 + j - startDay);
      // Trigger flag to stop adding weeks once we reach today's date
      if (date.toDateString() === endDate.toDateString()) {
        chart_cutoff = true;
        break;
      }
      // Create a normalized date string in YYYY-MM-DD format accommodating for getMonth starting at 0 and leading zeros
      // Using a generated key for activityData lookup
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;
      // Add the day to the week array
      week.push({ date, count: activityData[key] || 0 });
    }
    // Add the completed week to the weeks array
    builtWeeks.push(week);
  }
  return builtWeeks;
};

// Main component. It reads the browser's date, time zone and language, so it
// is only rendered in the browser (see components/DetailsDashboard.tsx). That
// lets it compute everything during render instead of in effects.
const StudentActivityChart = ({
  timestamps
}: StudentActivityChartProps): React.JSX.Element => {
  // Read the date once, when the chart first renders. Calling new Date() on
  // every render would make the render impure.
  const [today] = useState(() => new Date());
  const activityData = generateActivityData(timestamps, today);
  const weeks = buildWeeks(activityData, today);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Start scrolled to the most recent weeks, where current activity is.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks.length]);

  return (
    <div className={styles.parentContainer}>
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.contributionsTotal}>
            {Object.keys(activityData).length} active days in the last year
          </h2>
        </div>
        <div className={styles.chart}>
          <div className={styles.dayLabels}>
            {daysOfWeek.map((day, index) => (
              <div key={index} className={styles.dayLabel}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.scrollableContainer} ref={scrollRef}>
            <div className={styles.monthLabels}>
              {weeks.map((week, index) => {
                // Find the day in the week that is the first of the month
                const firstDay = week.find(
                  (d): d is DatedDay =>
                    !!(d && d.date && d.date.getDate() === 1)
                );

                if (firstDay) {
                  return (
                    <div key={index} className={styles.monthLabel}>
                      {firstDay.date.toLocaleString('default', {
                        month: 'short'
                      })}
                    </div>
                  );
                }

                // If this is the very first week, fall back to the first available day
                if (index === 0) {
                  const firstDatedDay = week.find(
                    (d): d is DatedDay => !!(d && d.date)
                  );
                  if (firstDatedDay) {
                    return (
                      <div key={index} className={styles.monthLabel}>
                        {firstDatedDay.date.toLocaleString('default', {
                          month: 'short'
                        })}
                      </div>
                    );
                  }
                }

                return <div key={index} className={styles.monthLabel}></div>;
              })}
            </div>

            <div className={styles.grid}>
              {weeks.map((week, index) => (
                <div key={index} className={styles.week}>
                  {week.map((day, dayIndex) =>
                    day.date ? (
                      <div
                        key={dayIndex}
                        className={styles.day}
                        style={{ backgroundColor: getColor(day.count) }}
                        title={`${day.date.toDateString()}: ${
                          day.count
                        } completions`}
                      ></div>
                    ) : (
                      <div key={dayIndex} className={styles.dayEmpty}></div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: activityLevels[0] }}
          ></div>
          <span>Inactive</span>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: activityLevels[1] }}
          ></div>
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityChart;
