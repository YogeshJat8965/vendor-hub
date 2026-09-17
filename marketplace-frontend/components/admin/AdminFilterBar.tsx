'use client';

import { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FilterPill<T extends string = string> {
  value: T;
  label: string;
  /** Live count for this pill. Always computed from real data, never hardcoded. */
  count?: number;
  tone?: 'default' | 'danger' | 'warning';
}

const PILL_ACTIVE_TONE = {
  default: 'bg-[#2C2621] text-white border-[#2C2621]',
  danger: 'bg-[#B85C5C] text-white border-[#B85C5C]',
  warning: 'bg-[#C4975A] text-white border-[#C4975A]',
} as const;

const COUNT_ACTIVE_TONE = {
  default: 'bg-white/20 text-white',
  danger: 'bg-white/25 text-white',
  warning: 'bg-white/25 text-white',
} as const;

/**
 * Search box plus a row of counted filter pills. The counts are part of the
 * contract: a pill that shows a number the list can't produce is the bug this
 * component exists to prevent.
 */
export function AdminFilterBar<T extends string>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  pills,
  activePill,
  onPillChange,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  pills?: FilterPill<T>[];
  activePill?: T;
  onPillChange?: (value: T) => void;
  /** Extra controls (selects, sort, export) rendered beside the search box. */
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C8E82] pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#9C8E82] hover:bg-[#E7DBCD] hover:text-[#2C2621] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>

      {pills && pills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => {
            const isActive = pill.value === activePill;
            const tone = pill.tone ?? 'default';

            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => onPillChange?.(pill.value)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-all duration-200',
                  isActive
                    ? `${PILL_ACTIVE_TONE[tone]} shadow-warm-sm`
                    : 'border-[#CDC0B0] bg-white text-[#6B5E54] hover:bg-[#E7DBCD]/60 hover:text-[#2C2621]'
                )}
              >
                {pill.label}
                {pill.count !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                      isActive ? COUNT_ACTIVE_TONE[tone] : 'bg-[#E7DBCD] text-[#6B5E54]'
                    )}
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
