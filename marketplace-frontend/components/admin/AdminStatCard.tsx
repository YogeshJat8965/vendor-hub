'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

const TONE_STYLES: Record<StatTone, string> = {
  neutral: 'bg-[#E7DBCD] text-[#6B5E54]',
  success: 'bg-[#5B8C5A]/12 text-[#5B8C5A]',
  warning: 'bg-[#C4975A]/14 text-[#C4975A]',
  danger: 'bg-[#B85C5C]/12 text-[#B85C5C]',
  accent: 'bg-[#CDB79E]/25 text-[#8A6534]',
};

export interface AdminStatCardProps {
  label: string;
  /** Rendered as-is. Pass a formatted string, not a raw number. */
  value?: string | number | null;
  icon: LucideIcon;
  tone?: StatTone;
  /** Signed percentage against the previous period of equal length, e.g. `+12.5`. */
  changePercent?: number | null;
  changeLabel?: string;
  hint?: string;
  /**
   * Renders the card dimmed with an em dash instead of a value. Used where the
   * underlying subsystem does not exist yet (revenue has no payment
   * integration), so the slot stays in the layout without showing a number
   * that would be untrue.
   */
  placeholder?: boolean;
  onClick?: () => void;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  changePercent,
  changeLabel = 'vs previous period',
  hint,
  placeholder = false,
  onClick,
}: AdminStatCardProps) {
  const interactive = Boolean(onClick) && !placeholder;
  const hasChange = !placeholder && changePercent !== null && changePercent !== undefined;
  const TrendIcon = !hasChange ? Minus : changePercent! > 0 ? TrendingUp : changePercent! < 0 ? TrendingDown : Minus;

  const trendColor = !hasChange
    ? 'text-[#9C8E82]'
    : changePercent! > 0
      ? 'text-[#5B8C5A]'
      : changePercent! < 0
        ? 'text-[#B85C5C]'
        : 'text-[#9C8E82]';

  return (
    <Card
      onClick={onClick}
      className={cn(
        'py-0 transition-all duration-300',
        placeholder && 'opacity-60 border-dashed',
        interactive && 'cursor-pointer hover:shadow-[0_8px_32px_rgba(44,38,33,0.10)] hover:-translate-y-0.5'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-[#6B5E54] truncate">{label}</p>
            <p className="mt-1.5 font-heading text-3xl font-bold text-[#2C2621] tabular-nums">
              {placeholder ? '—' : (value ?? '—')}
            </p>

            {hasChange && (
              <div className="mt-2 flex items-center gap-1.5">
                <TrendIcon className={cn('w-4 h-4', trendColor)} />
                <span className={cn('font-body text-sm font-medium tabular-nums', trendColor)}>
                  {changePercent! > 0 ? '+' : ''}
                  {changePercent!.toFixed(1)}%
                </span>
                <span className="font-body text-xs text-[#9C8E82]">{changeLabel}</span>
              </div>
            )}

            {hint && <p className="mt-2 font-body text-xs text-[#9C8E82]">{hint}</p>}
          </div>

          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              TONE_STYLES[tone]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
