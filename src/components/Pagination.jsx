import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { PAGE_SIZES } from '../lib/vocabulary';

// Page numbers to show: always first and last, a window around the current
// page, and `null` for each gap (rendered as an ellipsis).
function pageList(page, pageCount) {
  const pages = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null);
    }
  }
  return pages;
}

const NAV_BUTTON =
  'flex h-9 cursor-pointer items-center gap-1 rounded-full border border-line px-3 text-[13px] font-medium text-muted hover:border-muted hover:text-text disabled:cursor-default disabled:opacity-45 disabled:hover:border-line disabled:hover:text-muted md:h-[30px]';

// Footer for the vocabulary table. Rendered only when there is more than one page.
function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.ceil(total / pageSize);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-line px-4 py-3.5 lg:px-[22px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] text-muted tabular-nums" aria-live="polite">
          Showing{' '}
          <span className="font-semibold text-text">
            {first}–{last}
          </span>{' '}
          of <span className="font-semibold text-text">{total}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted">Per page</span>
          <div
            className="flex gap-0.5 rounded-lg border border-line bg-surface p-[3px]"
            role="group"
            aria-label="Words per page"
          >
            {PAGE_SIZES.map((size) => {
              const active = size === pageSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  aria-pressed={active}
                  className={`h-8 cursor-pointer rounded-md border px-2.5 text-[13px] tabular-nums md:h-7 md:px-3 ${
                    active
                      ? 'border-accent bg-tint font-semibold text-accent'
                      : 'border-transparent font-medium text-muted hover:bg-hover hover:text-text'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={NAV_BUTTON}
        >
          <CaretLeft className="text-sm" />
          Prev
        </button>

        {/* Numbered pages from md up; a plain "Page X of Y" below it. */}
        <div className="hidden items-center gap-1 md:flex">
          {pageList(page, pageCount).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-[13px] text-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={`h-[30px] min-w-[30px] cursor-pointer rounded-full border px-2 text-[13px] tabular-nums ${
                  p === page
                    ? 'border-accent bg-tint font-semibold text-accent'
                    : 'border-transparent font-medium text-muted hover:border-line hover:text-text'
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <div className="text-[13px] text-muted tabular-nums md:hidden">
          Page <span className="font-semibold text-text">{page}</span> of{' '}
          {pageCount}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          className={NAV_BUTTON}
        >
          Next
          <CaretRight className="text-sm" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
