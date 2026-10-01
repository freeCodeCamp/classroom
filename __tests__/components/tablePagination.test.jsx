import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TablePagination, {
  getEntriesPerPageOptions,
  getPageRange
} from '../../components/TablePagination';

describe('getEntriesPerPageOptions', () => {
  it('offers the smaller base sizes plus the total when under 100', () => {
    expect(getEntriesPerPageOptions(42)).toEqual([10, 20, 42]);
  });

  it('offers only the base sizes when there are 100 or more entries', () => {
    expect(getEntriesPerPageOptions(250)).toEqual([10, 20, 50, 100]);
  });

  // Regression: the users table used to offer "0" rows per page.
  it('still offers 10 for an empty table', () => {
    expect(getEntriesPerPageOptions(0)).toEqual([10]);
  });
});

describe('getPageRange', () => {
  it('describes the entries on the current page', () => {
    expect(getPageRange(1, 10, 42)).toEqual({ startEntry: 11, endEntry: 20 });
    expect(getPageRange(4, 10, 42)).toEqual({ startEntry: 41, endEntry: 42 });
  });

  // Regression: the users table used to show "1-0 of 0".
  it('shows 0-0 for an empty table', () => {
    expect(getPageRange(0, 10, 0)).toEqual({ startEntry: 0, endEntry: 0 });
  });
});

describe('TablePagination', () => {
  const renderPagination = props => {
    const onPageChange = jest.fn();
    const onEntriesPerPageChange = jest.fn();
    render(
      <TablePagination
        id='test'
        entriesPerPage={10}
        totalEntries={42}
        onPageChange={onPageChange}
        onEntriesPerPageChange={onEntriesPerPageChange}
        {...props}
      />
    );
    return { onPageChange, onEntriesPerPageChange };
  };

  it('disables First and Previous on the first page', () => {
    const { onPageChange } = renderPagination({ pageIndex: 0 });

    expect(screen.getByText('1–10 of 42')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'First page' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('jumps to the last page and disables Next on it', () => {
    const { onPageChange } = renderPagination({ pageIndex: 2 });
    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    onPageChange.mockClear();
    renderPagination({ pageIndex: 4 });
    const nextButtons = screen.getAllByRole('button', { name: 'Next page' });
    fireEvent.click(nextButtons[nextButtons.length - 1]);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('changes the page size from the labelled select', () => {
    const { onEntriesPerPageChange } = renderPagination({ pageIndex: 0 });

    fireEvent.change(screen.getByLabelText('Rows per page'), {
      target: { value: '20' }
    });

    expect(onEntriesPerPageChange).toHaveBeenCalledWith(20);
  });
});
