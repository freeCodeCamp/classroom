import { Button, ControlLabel } from '@freecodecamp/ui';
import FormSelect from './helpers/form-select';

const BASE_ENTRIES_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// Offers the base page sizes smaller than the total, plus "all" (the total)
// when it's under 100. An empty table still offers 10.
export const getEntriesPerPageOptions = totalEntries => {
  const options = BASE_ENTRIES_PER_PAGE_OPTIONS.filter(
    option => option < totalEntries
  );
  if (totalEntries > 0 && totalEntries < 100) {
    options.push(totalEntries);
  }
  return options.length === 0 ? [10] : [...new Set(options)];
};

export const getPageRange = (pageIndex, entriesPerPage, totalEntries) => ({
  startEntry: totalEntries === 0 ? 0 : pageIndex * entriesPerPage + 1,
  endEntry: Math.min((pageIndex + 1) * entriesPerPage, totalEntries)
});

/**
 * Pagination controls shared by the admin tables. @freecodecamp/ui has no
 * pagination component, so this is built from its Button and ControlLabel
 * plus FormSelect.
 */
export default function TablePagination({
  id,
  pageIndex,
  entriesPerPage,
  totalEntries,
  onPageChange,
  onEntriesPerPageChange
}) {
  const { startEntry, endEntry } = getPageRange(
    pageIndex,
    entriesPerPage,
    totalEntries
  );
  const lastPageIndex = Math.max(
    Math.ceil(totalEntries / entriesPerPage) - 1,
    0
  );
  const canPreviousPage = pageIndex > 0;
  const canNextPage = endEntry < totalEntries;
  const selectId = `${id}-rows-per-page`;

  return (
    <div className='flex flex-wrap items-center justify-end gap-x-4 gap-y-2'>
      <div className='flex items-center gap-2'>
        <ControlLabel htmlFor={selectId}>Rows per page</ControlLabel>
        <div className='w-20'>
          <FormSelect
            id={selectId}
            value={entriesPerPage}
            onChange={event =>
              onEntriesPerPageChange(Number(event.target.value))
            }
          >
            {getEntriesPerPageOptions(totalEntries).map(option => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>
      <span aria-live='polite'>
        {startEntry}–{endEntry} of {totalEntries}
      </span>
      <div className='flex gap-1'>
        <Button
          size='small'
          aria-label='First page'
          disabled={!canPreviousPage}
          onClick={() => onPageChange(0)}
        >
          <span aria-hidden='true' className='text-lg leading-none'>
            «
          </span>
        </Button>
        <Button
          size='small'
          aria-label='Previous page'
          disabled={!canPreviousPage}
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <span aria-hidden='true' className='text-lg leading-none'>
            ‹
          </span>
        </Button>
        <Button
          size='small'
          aria-label='Next page'
          disabled={!canNextPage}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <span aria-hidden='true' className='text-lg leading-none'>
            ›
          </span>
        </Button>
        <Button
          size='small'
          aria-label='Last page'
          disabled={!canNextPage}
          onClick={() => onPageChange(lastPageIndex)}
        >
          <span aria-hidden='true' className='text-lg leading-none'>
            »
          </span>
        </Button>
      </div>
    </div>
  );
}
