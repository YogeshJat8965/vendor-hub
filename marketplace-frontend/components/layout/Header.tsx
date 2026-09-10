'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { LogoutDialog } from '@/components/dialogs/LogoutDialog';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Vendors', href: '/for-vendors' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${scrolled ? 'shadow-md border-b border-[#CDC0B0]/30 py-2' : 'border-b border-[#CDC0B0]/20 py-4'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-baseline space-x-1 group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-3xl font-heading font-bold text-[#2C2621]"
            >
              VendorHub
            </motion.div>
            <span className="font-accent text-xl text-[#C4975A] group-hover:text-[#2C2621] transition-colors duration-300 hidden sm:inline-block">marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-body font-medium transition-all duration-300 relative group ${
                    isActive 
                      ? 'text-[#2C2621]' 
                      : 'text-[#6B5E54] hover:text-[#2C2621]'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#CDB79E] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-xl"
                  asChild
                >
                  <Link href={
                    user?.role?.toLowerCase() === 'customer' 
                      ? '/dashboard/customer' 
                      : user?.role?.toLowerCase() === 'vendor' 
                      ? '/dashboard/vendor' 
                      : '/dashboard/admin'
                  }>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="gap-2 text-[#B85C5C] hover:bg-[#B85C5C]/10 hover:text-[#B85C5C]"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-[#2C2621]" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-[#2C2621] text-white hover:bg-[#2C2621]/90 rounded-xl px-6">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-target text-[#2C2621]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white border-l-[#CDC0B0]/50">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-baseline space-x-1 pb-4 border-b border-[#CDC0B0]/30">
                    <div className="text-2xl font-heading font-bold text-[#2C2621]">VendorHub</div>
                    <span className="font-accent text-lg text-[#C4975A]">marketplace</span>
                  </div>
                  
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`text-lg font-body font-medium transition-all py-2 touch-target ${
                            isActive 
                              ? 'text-[#2C2621] border-l-2 border-[#CDB79E] pl-4' 
                              : 'text-[#6B5E54] hover:text-[#2C2621] hover:pl-2'
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  
                  <div className="pt-6 border-t border-[#CDC0B0]/30 space-y-3">
                    {isAuthenticated ? (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full touch-target gap-2 justify-start rounded-xl" 
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={
                            user?.role?.toLowerCase() === 'customer' 
                              ? '/dashboard/customer' 
                              : user?.role?.toLowerCase() === 'vendor' 
                              ? '/dashboard/vendor' 
                              : '/dashboard/admin'
                          }>
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full touch-target gap-2 justify-start text-[#B85C5C] hover:bg-[#B85C5C]/10" 
                          onClick={() => {
                            setIsOpen(false);
                            setShowLogoutDialog(true);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full touch-target rounded-xl" asChild>
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button className="w-full bg-[#2C2621] text-white touch-target rounded-xl" asChild>
                          <Link href="/signup">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          logout();
        }}
      />
    </header>
  );
}
