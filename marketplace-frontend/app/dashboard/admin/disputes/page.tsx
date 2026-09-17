'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Delivery Disputes was folded into the Deliveries page as a filter (Phase 6),
 * which gives disputes the surrounding quote context they were missing on
 * their own. This route is kept — rather than deleted — so any bookmark or
 * link to the old page still lands somewhere useful instead of a 404.
 */
export default function DisputesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/deliveries?status=DISPUTED');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
    </div>
  );
}
