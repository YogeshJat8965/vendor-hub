'use client';

import { InboxUI } from '@/components/inbox/InboxUI';
import { useAuth } from '@/lib/auth-context';

export default function VendorInboxPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#FDFBF7] rounded-3xl pt-8 sm:pt-12 px-4 sm:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#2C2621]">Inbox</h1>
          <p className="text-[#6B5E54] font-body mt-2">Chat with your customers directly.</p>
        </div>
        
        {user?.email && <InboxUI userRole="VENDOR" userId={user.email} />}
      </div>
    </div>
  );
}
