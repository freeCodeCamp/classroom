import React, { useEffect, useState } from 'react';
import styles from './StudentActivityChart.module.css';

// Display only Mon, Wed, Fri labels to reduce visual clutter (like GitHub)
const daysOfWeek = ['Mon', 'Wed', 'Fri'];

// Function to return all student activity in the past year into a dictionary to reference
const generateActivityData = timestamps => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  // Creating a map of date strings to activity counts to house the chart array data
  const activityData = {};
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

const activityLevels = ['#3b3b4f', '#99c9ff'];

// Helper function to determine color based on activity count
const getColor = count => {
  if (count > 0) return activityLevels[1];
  return activityLevels[0];
};

// Helper function to get the date exactly one year prior
const getPreviousYearDate = date => {
  const previousYearDate = new Date(date);
  previousYearDate.setFullYear(date.getFullYear() - 1);
  return previousYearDate;
};

// Main component
const StudentActivityChart = ({ timestamps }) => {
  const [weeks, setWeeks] = useState([]);
  const [activityData, setActivityData] = useState({});

  // Updates the activity data dictionary with the timestamps for the student user activity
  useEffect(() => {
    const Data = generateActivityData(timestamps);
    setActivityData(Data);
  }, [timestamps]);

  useEffect(() => {
    const today = new Date();
    const startDate = getPreviousYearDate(today);

    // Increment today to the next day to include today's activity
    today.setDate(today.getDate() + 1);

    /*
    Build weeks array for the chart.
    The total weeks is 54 with the first week and last week being special 
    as they may not contain a full 7 days of data.
    */
    const weeks = [];
    let firstWeek = [];
    const startDay = startDate.getDay();

    // Fill the first week with the correct dates
    for (let i = 0; i < startDay; i++) {
      firstWeek.push({ date: null, count: 0 });
    }

    // Initializing a check to stop adding weeks once we reach today's date
    let chart_cutoff = false;

    // If we're on the first week use the pre-filled firstWeek array otherwise we are starting fresh
    for (let i = 0; i < 54; i++) {
      let week;
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
        if (date.toDateString() === today.toDateString()) {
          chart_cutoff = true;
          break;
        }
        // Create a normalized date string in YYYY-MM-DD format accommodating for getMonth starting at 0 and leading zeros
        // Using a generated key for activityData lookup
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        // Add the day to the week array
        week.push({ date, count: activityData[key] || 0 });
      }
      // Add the completed week to the weeks array
      weeks.push(week);
    }
    // Update the weeks state
    setWeeks(weeks);
  }, [activityData]);

  return (
    <div className={styles.parentContainer}>
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.contributionsTotal}>
            {Object.keys(activityData).length} contributions in the last year
          </h3>
        </div>
        <div className={styles.chart}>
          <div className={styles.dayLabels}>
            {daysOfWeek.map((day, index) => (
              <div key={index} className={styles.dayLabel}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.scrollableContainer}>
            <div className={styles.monthLabels}>
              {weeks.map((week, index) => {
                // Find the day in the week that is the first of the month
                const firstDay = week.find(
                  d => d && d.date && d.date.getDate() === 1
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
                  const firstDay = week.find(d => d && d.date);
                  if (firstDay) {
                    return (
                      <div key={index} className={styles.monthLabel}>
                        {firstDay.date.toLocaleString('default', {
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
                  {week.map((day, index) =>
                    day.date ? (
                      <div
                        key={index}
                        className={styles.day}
                        style={{ backgroundColor: getColor(day.count) }}
                        title={`${day.date.toDateString()}: ${
                          day.count
                        } completions`}
                      ></div>
                    ) : (
                      <div key={index} className={styles.dayEmpty}></div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          <span>Inactive</span>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: activityLevels[0] }}
          ></div>
          <span>Active</span>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: activityLevels[1] }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityChart;
