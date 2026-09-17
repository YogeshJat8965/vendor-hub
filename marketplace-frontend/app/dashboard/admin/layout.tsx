'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  Flag,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  BarChart3,
  Truck,
  Layers,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LogoutDialog } from '@/components/dialogs/LogoutDialog';
import { NotificationBell } from '@/components/notifications/NotificationBell';

/**
 * Grouped so the sidebar reads as a control panel rather than a flat list.
 * Analytics is included here because the page has always existed at
 * /dashboard/admin/analytics but was never linked from anywhere — it was
 * reachable only by typing the URL.
 */
const navSections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'Vendors', href: '/dashboard/admin/vendors', icon: Building2 },
      { name: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: CreditCard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Flagged Reviews', href: '/dashboard/admin/reviews', icon: Flag },
      { name: 'Deliveries', href: '/dashboard/admin/deliveries', icon: Truck },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { name: 'Plans', href: '/dashboard/admin/plans', icon: Layers },
      { name: 'Categories', href: '/dashboard/admin/categories', icon: FolderTree },
      { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
  },
];

interface BadgeCounts {
  vendorApprovals: number;
  flaggedReviews: number;
  disputes: number;
}

/** Live pending-vendor, flagged-review and dispute counts, replacing what used to be hardcoded sidebar badges. */
function useAdminBadgeCounts(): BadgeCounts {
  const [counts, setCounts] = useState<BadgeCounts>({
    vendorApprovals: 0,
    flaggedReviews: 0,
    disputes: 0,
  });

  useEffect(() => {
    apiClient
      .get('/admin/pending-actions')
      .then((res) => {
        const actions: any[] = res.data || [];
        setCounts({
          vendorApprovals: actions.filter((a) => a.type === 'vendor_approval').length,
          flaggedReviews: actions.filter((a) => a.type === 'flagged_review').length,
          disputes: actions.filter((a) => a.type === 'dispute').length,
        });
      })
      .catch((err) => console.error('Failed to fetch pending action counts', err));
  }, []);

  return counts;
}

function navBadge(href: string, counts: BadgeCounts): number {
  if (href.endsWith('/vendors')) return counts.vendorApprovals;
  if (href.endsWith('/reviews')) return counts.flaggedReviews;
  if (href.endsWith('/deliveries')) return counts.disputes;
  return 0;
}

/**
 * The nav itself, shared by the desktop sidebar and the mobile sheet so the
 * two can never drift apart.
 */
function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const badgeCounts = useAdminBadgeCounts();

  return (
    <nav className="space-y-5 py-4">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-[#9C8E82]">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const badgeCount = navBadge(item.href, badgeCounts);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-body font-medium ${
                    isActive
                      ? 'bg-[#EEDDCC] text-[#2C2621] shadow-warm-sm'
                      : 'text-[#6B5E54] hover:bg-[#E7DBCD]/50 hover:text-[#2C2621]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#2C2621]' : 'text-[#9C8E82]'}`} />
                  <span className="flex-1">{item.name}</span>
                  {badgeCount > 0 && (
                    <Badge variant="warning" className={`ml-auto ${isActive ? 'bg-white shadow-warm-sm' : ''}`}>
                      {badgeCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#CDC0B0]/50">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard/admin" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#2C2621] flex items-center justify-center shadow-warm-sm">
            <Shield className="w-6 h-6 text-[#EEDDCC]" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#2C2621]">Admin Panel</h1>
          </div>
        </Link>
      </div>

      <Separator />

      {/* Admin Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 bg-[#FDFBF7] rounded-xl border border-[#CDC0B0]/30">
          <div className="w-10 h-10 rounded-full bg-[#CDB79E] flex items-center justify-center text-[#2C2621] font-heading font-bold text-lg shadow-warm-sm">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm text-[#2C2621] truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-[#6B5E54] font-body truncate">{user?.email || 'Administrator'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <AdminNav />
      </ScrollArea>

      <Separator />

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-[#B85C5C] hover:text-white hover:bg-[#B85C5C] touch-target rounded-xl font-body transition-colors duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          logout();
        }}
      />
    </div>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-[#2C2621]">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 border-r-[#CDC0B0]/50 bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <Link href="/dashboard/admin" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-[#2C2621] flex items-center justify-center shadow-warm-sm">
                <Shield className="w-6 h-6 text-[#EEDDCC]" />
              </div>
              <h1 className="text-xl font-heading font-bold text-[#2C2621]">Admin Panel</h1>
            </Link>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-[#6B5E54] hover:bg-[#E7DBCD]/50 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>

          <Separator />

          {/* Admin Info */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-[#FDFBF7] rounded-xl border border-[#CDC0B0]/30">
              <div className="w-10 h-10 rounded-full bg-[#CDB79E] flex items-center justify-center text-[#2C2621] font-heading font-bold text-lg shadow-warm-sm">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm text-[#2C2621] truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#6B5E54] font-body truncate">{user?.email || 'Administrator'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <AdminNav onNavigate={() => setOpen(false)} />
          </ScrollArea>

          <Separator />

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#B85C5C] hover:text-white hover:bg-[#B85C5C] touch-target rounded-xl font-body transition-colors duration-300"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          logout();
        }}
      />
    </Sheet>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /**
   * "Admin / Flagged Reviews" rather than "Dashboard / Admin / Reviews".
   * The old version title-cased raw URL segments, so the current page was
   * labelled by its folder name instead of the name shown in the sidebar.
   */
  const breadcrumbs = (() => {
    const crumbs = [{ href: '/dashboard/admin', label: 'Admin' }];
    if (pathname === '/dashboard/admin') return crumbs;

    const navName = navSections
      .flatMap((section) => section.items)
      .find((item) => item.href === pathname)?.name;

    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    const fallback = segment.charAt(0).toUpperCase() + segment.slice(1);

    crumbs.push({ href: pathname, label: navName ?? fallback });
    return crumbs;
  })();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-[#FDFBF7]">
        <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-[#CDC0B0]/50 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-[#CDC0B0]/50 px-4 sm:px-6 lg:px-8 py-4 shadow-[0_2px_10px_rgba(44,38,33,0.03)] z-10">
            <div className="flex items-center gap-4">
              <MobileSidebar />

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm font-body">
                {breadcrumbs.map((crumb, index) => (
                  <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
                    {index > 0 && <span className="text-[#9C8E82]">/</span>}
                    <Link
                      href={crumb.href}
                      className={`${
                        index === breadcrumbs.length - 1
                          ? 'text-[#2C2621] font-semibold'
                          : 'text-[#6B5E54] hover:text-[#C4975A] transition-colors'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="ml-auto flex items-center">
                <NotificationBell />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
