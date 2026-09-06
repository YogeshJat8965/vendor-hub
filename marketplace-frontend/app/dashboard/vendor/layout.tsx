'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Star,
  Store,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  TrendingUp,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/vendor',
    icon: LayoutDashboard,
  },
  {
    title: 'Quotes',
    href: '/dashboard/vendor/quotes',
    icon: FileText,
    badge: 5, // Pending quotes count
  },
  {
    title: 'Reviews',
    href: '/dashboard/vendor/reviews',
    icon: Star,
  },
  {
    title: 'Inbox',
    href: '/dashboard/vendor/inbox',
    icon: MessageSquare,
  },
  {
    title: 'Catalogues',
    href: '/dashboard/vendor/catalogues',
    icon: Layers,
  },
  {
    title: 'Storefront',
    href: '/dashboard/vendor/storefront',
    icon: Store,
  },
  {
    title: 'Analytics',
    href: '/dashboard/vendor/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    href: '/dashboard/vendor/settings',
    icon: Settings,
  },
];

// Mock vendor data - will be replaced with API
const vendor = {
  businessName: 'Johns Plumbing Services',
  email: 'john@johnsplumbing.com',
  logo: null,
  isPremium: true,
};

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#CDC0B0]/50">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="block group">
          <h1 className="text-2xl font-heading font-bold text-[#2C2621]">VendorHub</h1>
          <span className="font-accent text-lg text-[#CDB79E] group-hover:text-[#2C2621] transition-colors duration-300">marketplace</span>
        </Link>
      </div>

      <Separator />

      {/* Vendor Info */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border border-[#CDC0B0]/30">
            <AvatarImage src={vendor.logo || undefined} />
            <AvatarFallback className="bg-[#CDB79E] text-[#2C2621] font-heading font-semibold">
              {vendor.businessName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-[#2C2621] text-sm truncate">{vendor.businessName}</h3>
            <p className="font-body text-xs text-[#6B5E54] truncate">{vendor.email}</p>
          </div>
        </div>
        {vendor.isPremium && (
          <Badge className="mt-3 bg-[#2C2621] text-[#EEDDCC] hover:bg-[#2C2621]/90 border-0 shadow-warm-sm">
            <TrendingUp className="w-3 h-3 mr-1 text-[#CDB79E]" />
            Premium
          </Badge>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 touch-target font-body font-medium ${
                  isActive
                    ? 'bg-[#EEDDCC] text-[#2C2621] shadow-warm-sm'
                    : 'text-[#6B5E54] hover:bg-[#E7DBCD]/50 hover:text-[#2C2621]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#2C2621]' : 'text-[#9C8E82]'}`} />
                <span className="flex-1">{item.title}</span>
                {item.badge && !isActive && (
                  <Badge variant="warning" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#2C2621]" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

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
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden touch-target text-[#2C2621]">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 border-r-[#CDC0B0]/50 bg-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)} className="group">
              <h1 className="text-2xl font-heading font-bold text-[#2C2621]">VendorHub</h1>
              <span className="font-accent text-lg text-[#CDB79E]">marketplace</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="touch-target text-[#6B5E54] hover:bg-[#E7DBCD]/50 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator />

          {/* Vendor Info */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border border-[#CDC0B0]/30">
                <AvatarImage src={vendor.logo || undefined} />
                <AvatarFallback className="bg-[#CDB79E] text-[#2C2621] font-heading font-semibold">
                  {vendor.businessName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-[#2C2621] text-sm truncate">{vendor.businessName}</h3>
                <p className="font-body text-xs text-[#6B5E54] truncate">{vendor.email}</p>
              </div>
            </div>
            {vendor.isPremium && (
              <Badge className="mt-3 bg-[#2C2621] text-[#EEDDCC] border-0 shadow-warm-sm">
                <TrendingUp className="w-3 h-3 mr-1 text-[#CDB79E]" />
                Premium
              </Badge>
            )}
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 touch-target font-body font-medium ${
                      isActive
                        ? 'bg-[#EEDDCC] text-[#2C2621] shadow-warm-sm'
                        : 'text-[#6B5E54] hover:bg-[#E7DBCD]/50 hover:text-[#2C2621]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#2C2621]' : 'text-[#9C8E82]'}`} />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && !isActive && (
                      <Badge variant="warning" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#2C2621]" />}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

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
    </Sheet>
  );
}

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      let href = '/' + paths.slice(0, index + 1).join('/');
      
      // Fix: if the breadcrumb is just /dashboard, redirect to full dashboard path
      if (href === '/dashboard') {
        href = '/dashboard/vendor';
      }
      
      const title = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, title };
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <ProtectedRoute requiredRole="vendor">
      <div className="flex h-screen bg-[#FDFBF7]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
        <header className="bg-white border-b border-[#CDC0B0]/50 px-4 sm:px-6 py-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(44,38,33,0.03)] z-10">
          <MobileSidebar />
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-body">
            {breadcrumbs.map((crumb, index) => (
              <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-[#9C8E82]" />}
                <Link
                  href={crumb.href}
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-[#2C2621] font-semibold'
                      : 'text-[#6B5E54] hover:text-[#C4975A] transition-colors'
                  }`}
                >
                  {crumb.title}
                </Link>
              </div>
            ))}
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-8 py-8 lg:py-10 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
