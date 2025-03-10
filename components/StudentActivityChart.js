import React, { useEffect, useState } from 'react';
import styles from './StudentActivityChart.module.css';

const daysOfWeek = ['Mon', 'Wed', 'Fri'];

const generateActivityData = timestamps => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const activityData = {};
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

const activityLevels = ['#3b3b4f', '#4f5a6a', '#637a85', '#779aa0', '#99c9ff'];

const getColor = count => {
  if (count === 0) return activityLevels[0];
  if (count <= 2) return activityLevels[1];
  if (count <= 5) return activityLevels[2];
  if (count <= 10) return activityLevels[3];
  return activityLevels[4];
};

const getPreviousYearDate = date => {
  const previousYearDate = new Date(date);
  previousYearDate.setFullYear(date.getFullYear() - 1);
  return previousYearDate;
};

const StudentActivityChart = ({ timestamps }) => {
  const [weeks, setWeeks] = useState([]);
  const [activityData, setActivityData] = useState({});

  useEffect(() => {
    const Data = generateActivityData(timestamps);
    setActivityData(Data);
  }, [timestamps]);

  useEffect(() => {
    const today = new Date();
    // today.setDate(today.getDate() - 5);   // For testing purposes
    const startDate = getPreviousYearDate(today);

    // Increment today to the next day to include today's activity
    today.setDate(today.getDate() + 1);

    const weeks = [];
    let firstWeek = [];
    const startDay = startDate.getDay();

    // Fill the first week with the correct dates
    for (let i = 0; i < startDay; i++) {
      firstWeek.push({ date: null, count: 0 });
    }

    let chart_cutoff = false;
    for (let i = 0; i < 54; i++) {
      const week = i === 0 ? firstWeek : [];
      if (chart_cutoff) {
        break;
      }
      for (let j = week.length; j < 7; j++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i * 7 + j - startDay);
        if (date.toDateString() === today.toDateString()) {
          chart_cutoff = true;
          break;
        }
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        week.push({ date, count: activityData[key] || 0 });
      }
      weeks.push(week);
    }

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
        <div className={styles.monthLabels}>
          {weeks.map((week, index) => {
            const firstDay = week[0]?.date;
            if (firstDay && firstDay.getDate() <= 8 && firstDay.getDate() > 1) {
              return (
                <div key={index} className={styles.monthLabel}>
                  {firstDay.toLocaleString('default', { month: 'short' })}
                </div>
              );
            }
            return <div key={index} className={styles.monthLabel}></div>;
          })}
        </div>
        <div className={styles.chart}>
          <div className={styles.dayLabels}>
            {daysOfWeek.map((day, index) => (
              <div key={index} className={styles.dayLabel}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.chartWithLegend}>
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
            <div className={styles.legend}>
              <span>Less</span>
              {activityLevels.map((color, index) => (
                <div
                  key={index}
                  className={styles.legendColor}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityChart;
