'use client';

import { ReactNode, useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminEmptyState } from './AdminEmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer. Receives the whole row. */
  cell: (row: T) => ReactNode;
  /** Return a comparable primitive to make this column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  /** Hidden below `sm`, so the table stays readable on a phone. */
  hideOnMobile?: boolean;
}

export interface AdminDataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

export function AdminDataTable<T>({
  rows,
  columns,
  rowKey,
  isLoading = false,
  onRowClick,
  pageSize = 15,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'No records match the current filters.',
  emptyAction,
}: AdminDataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;

    // Copied before sorting so the caller's array is never mutated.
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av === bv) return 0;
      const result = av < bv ? -1 : 1;
      return sort.direction === 'asc' ? result : -result;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  // Filters can shrink the list under the current page; clamp rather than
  // render a blank table.
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = sortedRows.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#CDC0B0]/50 bg-white overflow-hidden">
        <div className="divide-y divide-[#CDC0B0]/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-9 w-9 rounded-full bg-[#E7DBCD] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded bg-[#E7DBCD] animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-[#E7DBCD]/70 animate-pulse" />
              </div>
              <div className="h-6 w-20 rounded-full bg-[#E7DBCD] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#CDC0B0]/50 bg-white">
        <AdminEmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#CDC0B0]/50 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50">
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const SortIcon = !isSorted ? ArrowUpDown : sort!.direction === 'asc' ? ArrowUp : ArrowDown;

                return (
                  <th
                    key={column.key}
                    className={cn(
                      'px-5 py-3 text-left font-body text-xs font-semibold uppercase tracking-wide text-[#6B5E54]',
                      column.hideOnMobile && 'hidden sm:table-cell',
                      column.headerClassName
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1.5 hover:text-[#2C2621] transition-colors"
                      >
                        {column.header}
                        <SortIcon className={cn('w-3.5 h-3.5', isSorted ? 'text-[#C4975A]' : 'text-[#9C8E82]')} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CDC0B0]/40">
            {pagedRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[#FDFBF7]'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-5 py-3.5 font-body text-sm text-[#2C2621] align-middle',
                      column.hideOnMobile && 'hidden sm:table-cell',
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-[#CDC0B0]/50 bg-[#FDFBF7] px-5 py-3">
          <p className="font-body text-xs text-[#6B5E54] tabular-nums">
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedRows.length)} of{' '}
            {sortedRows.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="font-body text-xs text-[#6B5E54] tabular-nums px-1">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
