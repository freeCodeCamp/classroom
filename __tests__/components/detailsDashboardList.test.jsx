import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsDashboardList from '../../components/DetailsDashboardList';

const props = {
  superblockTitle: 'Responsive Web Design',
  blockData: [
    {
      blockName: 'Learn HTML by Building a Cat Photo App',
      selector: 'learn-html-by-building-a-cat-photo-app',
      allChallenges: ['a', 'b', 'c']
    }
  ],
  studentProgressInBlocks: [
    {
      'learn-html-by-building-a-cat-photo-app': {
        completedChallenges: ['a', 'b']
      }
    }
  ]
};

describe('DetailsDashboardList', () => {
  it('starts collapsed', () => {
    render(<DetailsDashboardList {...props} />);

    expect(
      screen.getByRole('button', { name: 'View details' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('Learn HTML by Building a Cat Photo App')
    ).not.toBeInTheDocument();
  });

  it('expands to show block progress and collapses again', () => {
    render(<DetailsDashboardList {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'View details' }));

    const toggle = screen.getByRole('button', { name: 'View less' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('Learn HTML by Building a Cat Photo App')
    ).toBeVisible();
    expect(screen.getByText('2/3')).toBeVisible();

    fireEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: 'View details' })
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
