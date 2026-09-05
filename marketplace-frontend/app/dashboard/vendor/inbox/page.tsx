'use client';

import { InboxUI } from '@/components/inbox/InboxUI';
import { useAuth } from '@/lib/auth-context';

export default function VendorInboxPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inbox</h1>
        <p className="text-slate-500 mt-2">Chat with your customers directly.</p>
      </div>
      
      {user?.email && <InboxUI userRole="VENDOR" userId={user.email} />}
    </div>
  );
}
