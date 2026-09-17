'use client';

import { Badge } from '@/components/ui/badge';

/** Minimal shape needed to render a plan tag — matches GET /admin/plans's `plan` object. */
export interface PlanLookup {
  code: string;
  name: string;
  badgeColor?: string;
}

/**
 * A colored plan tag, using the admin's own chosen {@code badgeColor} for
 * that tier (set on the Plans page) rather than a fixed palette — so a
 * plan's colour in the directory always matches what the admin picked.
 */
export function AdminPlanBadge({
  planCode,
  plans,
  className,
}: {
  planCode: string | null | undefined;
  /** All plans, keyed or as a list — used to resolve the display name and colour. */
  plans: Record<string, PlanLookup> | PlanLookup[];
  className?: string;
}) {
  if (!planCode) {
    return <Badge variant="outline" className={className}>—</Badge>;
  }

  const lookup = Array.isArray(plans)
    ? Object.fromEntries(plans.map((p) => [p.code, p]))
    : plans;
  const plan = lookup[planCode];

  return (
    <Badge
      variant="outline"
      className={className}
      style={plan?.badgeColor ? { borderColor: plan.badgeColor, color: plan.badgeColor } : undefined}
    >
      {plan?.name ?? planCode}
    </Badge>
  );
}
