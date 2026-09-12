'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, FileText, MessageSquare, Star, UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, NotificationItem } from '@/lib/notifications-context';

const ICONS: Record<string, typeof Bell> = {
  QUOTE: FileText,
  MESSAGE: MessageSquare,
  REVIEW: Star,
  REVIEW_FLAG: ShieldAlert,
  ACCOUNT: UserCheck,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = async (notification: NotificationItem) => {
    setOpen(false);
    if (!notification.read) {
      await markRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#2C2621] bg-[#EEDDCC]/70 hover:bg-[#EEDDCC] hover:text-[#2C2621] touch-target rounded-full h-11 w-11 shadow-sm border border-[#CDC0B0]/40"
        >
          <Bell className="w-5 h-5" strokeWidth={2.25} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-[#D3453A] text-white text-[11px] font-bold font-body ring-2 ring-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border-[#CDC0B0]/50 bg-white shadow-warm-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#CDC0B0]/50 bg-[#FDFBF7] rounded-t-2xl">
          <span className="font-heading font-semibold text-[#2C2621] text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-xs font-body font-medium text-[#C4975A] hover:text-[#B38549]"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#9C8E82] font-body">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[#CDC0B0]/30 last:border-0 hover:bg-[#FDFBF7] transition-colors ${
                    !n.read ? 'bg-[#FBF3E7]' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-[#EEDDCC] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#C4975A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body font-semibold text-sm text-[#2C2621] truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#C4975A] shrink-0" />}
                    </div>
                    <p className="font-body text-xs text-[#6B5E54] line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="font-body text-[11px] text-[#9C8E82] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
