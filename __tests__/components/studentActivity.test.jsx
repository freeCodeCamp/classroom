import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import getStudentActivity from '../../components/studentActivity';
import ProgressBar from '../../components/ProgressBar';

const DAY_MS = 24 * 60 * 60 * 1000;

const renderActivity = recentCompletions =>
  render(<div>{getStudentActivity({ recentCompletions })}</div>);

describe('student activity indicator', () => {
  it('is Active with at least one completion in the past week', () => {
    renderActivity([Date.now() - 2 * DAY_MS]);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('is Inactive when the latest completion is older than a week', () => {
    renderActivity([Date.now() - 10 * DAY_MS]);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  // Regression: no completions used to show a 1969 "last completion" date.
  it('says there are no completions yet instead of a 1969 date', () => {
    renderActivity([]);
    expect(screen.getByText('Inactive')).toHaveAttribute(
      'title',
      'No completions yet'
    );
  });
});

describe('ProgressBar', () => {
  it('shows the count and exposes the value to assistive tech', () => {
    render(<ProgressBar value={5} max={20} label='Progress for a@b.c' />);

    expect(screen.getByText('5/20')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Progress for a@b.c' });
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '20');
    expect(bar.firstChild).toHaveStyle({ width: '25%' });
  });

  it('shows an empty bar when there are no challenges', () => {
    render(<ProgressBar value={0} max={0} label='Progress' />);
    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({
      width: '0%'
    });
  });
});
