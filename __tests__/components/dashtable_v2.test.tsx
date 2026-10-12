import { render } from '@testing-library/react';
import React from 'react';
import GlobalDashboardTable from '../../components/dashtable_v2';

import {
  studentData as testingStudentData,
  classroomId,
  totalChallenges
} from '../../testing_data/testing-data';
import type { StudentDashboardData } from '../../types/student';

const studentData = testingStudentData as unknown as StudentDashboardData[];

describe('GlobalDashboardTable', () => {
  // Define a fixed time in milliseconds
  const fixedTime = new Date('2016-03-09T12:00:00Z').getTime();

  // Spy on Date.prototype.getTime and mock its implementation
  const getTimeSpy = vi
    .spyOn(Date.prototype, 'getTime')
    .mockImplementation(() => fixedTime);

  // Restore the original getTime method after the test
  afterEach(() => {
    getTimeSpy.mockRestore();
  });

  test('renders dashtable with correct data format', () => {
    const { container } = render(
      <GlobalDashboardTable
        studentData={studentData}
        classroomId={classroomId}
        totalChallenges={totalChallenges}
      />
    );
    expect(getTimeSpy).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});
