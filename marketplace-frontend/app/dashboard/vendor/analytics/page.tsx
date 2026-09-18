'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Analytics is hidden for now — the real, working page lives in
 * AnalyticsPageContent.tsx in this same folder (not wired into the route
 * tree). Direct navigation here (a bookmark, browser history, a typed URL)
 * bounces to the dashboard instead of rendering it.
 */
export default function VendorAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/vendor');
  }, [router]);

  return null;
}
