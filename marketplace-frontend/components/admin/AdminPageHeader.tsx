'use client';

import { ReactNode } from 'react';

/**
 * The header every admin page opens with. Previously each page hand-rolled its
 * own `<h1 className="text-3xl font-bold">`, which is how they drifted apart
 * visually.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2C2621]">{title}</h1>
        {description && (
          <p className="mt-1.5 font-body text-sm text-[#6B5E54]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
