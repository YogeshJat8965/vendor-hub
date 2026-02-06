'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && requiredRole && user?.role?.toLowerCase() !== requiredRole) {
      // Wrong role - redirect to appropriate dashboard
      const role = user?.role?.toLowerCase();
      if (role === 'customer') {
        router.push('/dashboard/customer');
      } else if (role === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role?.toLowerCase() !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
