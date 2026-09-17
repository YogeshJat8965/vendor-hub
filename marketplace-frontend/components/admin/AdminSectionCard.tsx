'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** A titled panel — the dashboard's Pending Actions, Recent Activity, etc. */
export function AdminSectionCard({
  title,
  icon: Icon,
  action,
  children,
  contentClassName,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  /** Right-aligned slot in the header, e.g. a count badge or "View all" link. */
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  className?: string;
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[#CDC0B0]/40 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="w-4.5 h-4.5 text-[#9C8E82]" />}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className={cn('px-5 py-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
