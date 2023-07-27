import { render } from '@testing-library/react';
import React from 'react';
import GlobalDashboardTable from '../../components/dashboard/GlobalDashboardTable';

import {studentData, certifications, classroomId} from '../../testing_data/testing-data';


describe('GlobalDashboardTable', () => {
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
});
