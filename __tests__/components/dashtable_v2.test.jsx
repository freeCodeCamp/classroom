import { render } from '@testing-library/react';
import React from 'react';
import GlobalDashboardTable from '../../components/dashtable_v2.js';

import {studentData, certifications, classroomId} from '../../testing_data/testing-data';

describe('GlobalDashboardTable', () => {
  // Define a fixed time in milliseconds
  const fixedTime = new Date('2021-01-01T12:00:00').getTime();

  // Spy on Date.prototype.getTime and mock its implementation
  const getTimeSpy = jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => fixedTime);

  test('renders dashtable with correct data format', () => {
    const { container } = render(
      <GlobalDashboardTable
        studentData={studentData}
        certifications={certifications}
        classroomId={classroomId}
      />
    );

    expect(container).toMatchSnapshot();
  });

  // Restore the original getTime method after the test
  afterAll(() => {
    getTimeSpy.mockRestore();
  });
});
