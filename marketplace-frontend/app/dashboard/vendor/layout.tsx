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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
    title: 'Storefront',
    href: '/dashboard/vendor/storefront',
    icon: Store,
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

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold gradient-text">VendorHub</h1>
        </Link>
      </div>

      <Separator />

      {/* Vendor Info */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={vendor.logo || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {vendor.businessName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{vendor.businessName}</h3>
            <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
          </div>
        </div>
        {vendor.isPremium && (
          <Badge className="mt-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.title}</span>
                {item.badge && !isActive && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600">
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
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
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 touch-target"
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
        <Button variant="ghost" size="icon" className="lg:hidden touch-target">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              <h1 className="text-2xl font-bold gradient-text">VendorHub</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="touch-target"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator />

          {/* Vendor Info */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={vendor.logo || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {vendor.businessName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{vendor.businessName}</h3>
                <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
              </div>
            </div>
            {vendor.isPremium && (
              <Badge className="mt-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium flex-1">{item.title}</span>
                    {item.badge && !isActive && (
                      <Badge variant="secondary" className="bg-red-100 text-red-600">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
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
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 touch-target"
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
      const href = '/' + paths.slice(0, index + 1).join('/');
      const title = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, title };
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center gap-4">
          <MobileSidebar />
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <Link
                  href={crumb.href}
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
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
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
