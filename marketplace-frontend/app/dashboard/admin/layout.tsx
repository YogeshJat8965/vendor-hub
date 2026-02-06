'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Vendors',
    href: '/dashboard/admin/vendors',
    icon: Building2,
    badge: 8, // Pending approvals
  },
  {
    name: 'Users',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    name: 'Categories',
    href: '/dashboard/admin/categories',
    icon: FolderTree,
  },
  {
    name: 'Flagged Reviews',
    href: '/dashboard/admin/reviews',
    icon: Flag,
    badge: 3,
  },
  {
    name: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
  },
];

// Mock admin data
const adminData = {
  name: 'Admin User',
  email: 'admin@marketplace.com',
  role: 'Super Admin',
};

function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
          </div>
        </Link>
      </div>

      <Separator />

      {/* Admin Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {adminData.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{adminData.name}</p>
            <p className="text-xs text-gray-600 truncate">{adminData.role}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`ml-auto ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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

  const handleLogout = () => {
    console.log('Logout');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <Link href="/dashboard/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
            </Link>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>

          <Separator />

          {/* Admin Info */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {adminData.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{adminData.name}</p>
                <p className="text-xs text-gray-600 truncate">{adminData.role}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-auto ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      let href = '/' + paths.slice(0, index + 1).join('/');
      
      // Fix: if the breadcrumb is just /dashboard, redirect to full dashboard path
      if (href === '/dashboard') {
        href = '/dashboard/admin';
      }
      
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, label };
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-200">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <MobileSidebar />
              
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
                    {index > 0 && <span className="text-gray-400">/</span>}
                    <Link
                      href={crumb.href}
                      className={`${
                        index === breadcrumbs.length - 1
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
