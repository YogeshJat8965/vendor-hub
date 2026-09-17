'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Every status value the admin panel can render, keyed to what the backend
 * actually stores. Getting this wrong is not a cosmetic bug: the vendors page
 * used to test for `APPROVED`, a value no document has ever held, which made
 * the Suspend action unreachable and the Approved tab permanently read 0.
 *
 * Account statuses come from `Vendor.status` and the derived `AdminUserDto.status`.
 * Quote statuses come from `QuoteRequest.status`.
 */
export type AdminStatus =
  // accounts
  | 'ACTIVE'
  | 'PENDING'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'BANNED'
  // quote lifecycle
  | 'NEW'
  | 'IN_PROGRESS'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CLOSED'
  // subscription lifecycle (Subscription.status)
  | 'EXPIRED'
  | 'CANCELLED';

const STATUS_STYLES: Record<AdminStatus, string> = {
  ACTIVE: 'bg-[#5B8C5A]/12 text-[#3F6B3E] border-[#5B8C5A]/25',
  PENDING: 'bg-[#C4975A]/14 text-[#8A6534] border-[#C4975A]/30',
  REJECTED: 'bg-[#B85C5C]/12 text-[#8E4343] border-[#B85C5C]/25',
  SUSPENDED: 'bg-[#B85C5C]/12 text-[#8E4343] border-[#B85C5C]/25',
  BANNED: 'bg-[#B85C5C]/18 text-[#7A3636] border-[#B85C5C]/35',

  NEW: 'bg-[#6B8CAE]/12 text-[#3F5A75] border-[#6B8CAE]/25',
  IN_PROGRESS: 'bg-[#6B8CAE]/12 text-[#3F5A75] border-[#6B8CAE]/25',
  QUOTED: 'bg-[#C4975A]/14 text-[#8A6534] border-[#C4975A]/30',
  ACCEPTED: 'bg-[#8A7BA8]/14 text-[#5B4F73] border-[#8A7BA8]/28',
  DELIVERED: 'bg-[#CDB79E]/25 text-[#6B5233] border-[#CDB79E]/50',
  DISPUTED: 'bg-[#B85C5C]/18 text-[#7A3636] border-[#B85C5C]/35',
  COMPLETED: 'bg-[#5B8C5A]/12 text-[#3F6B3E] border-[#5B8C5A]/25',
  CLOSED: 'bg-[#E7DBCD] text-[#6B5E54] border-[#CDC0B0]',

  EXPIRED: 'bg-[#9C8E82]/14 text-[#6B5E54] border-[#9C8E82]/30',
  CANCELLED: 'bg-[#E7DBCD] text-[#6B5E54] border-[#CDC0B0]',
};

const STATUS_LABELS: Partial<Record<AdminStatus, string>> = {
  IN_PROGRESS: 'In progress',
  NEW: 'New',
};

/** Title-cases an unrecognised status rather than shouting it at the user. */
function humanize(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AdminStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className={cn('text-[#9C8E82]', className)}>
        Unknown
      </Badge>
    );
  }

  const key = status.toUpperCase() as AdminStatus;
  const style = STATUS_STYLES[key];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border font-medium',
        style ?? 'bg-[#E7DBCD] text-[#6B5E54] border-[#CDC0B0]',
        className
      )}
    >
      {STATUS_LABELS[key] ?? humanize(status)}
    </Badge>
  );
}
