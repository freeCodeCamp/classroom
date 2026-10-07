import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('shows the certification total without expanding', () => {
    render(<DetailsDashboardList {...props} />);

    const bar = screen.getByRole('progressbar', {
      name: 'Challenges completed in Responsive Web Design'
    });
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
  });

  it('puts the expanded block list in a keyboard-scrollable region', () => {
    render(<DetailsDashboardList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'View details' }));

    expect(
      screen.getByRole('region', { name: 'Responsive Web Design blocks' })
    ).toHaveAttribute('tabindex', '0');
  });

  it('expands to show block progress and collapses again', () => {
    render(<DetailsDashboardList {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'View details' }));

    const toggle = screen.getByRole('button', { name: 'View less' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('Learn HTML by Building a Cat Photo App')
    ).toBeVisible();
    expect(
      within(
        screen.getByRole('region', { name: 'Responsive Web Design blocks' })
      ).getByText('2/3')
    ).toBeVisible();

    fireEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: 'View details' })
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
