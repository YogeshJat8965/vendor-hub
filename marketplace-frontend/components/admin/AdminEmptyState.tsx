'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#E7DBCD] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#9C8E82]" />
      </div>
      <h3 className="font-heading font-semibold text-[#2C2621]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md font-body text-sm text-[#6B5E54]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
