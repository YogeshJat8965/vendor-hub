'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  name: string;
  slug?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface JWTPayload {
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  name?: string;
  slug?: string;
  exp?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken');
          setUser(null);
        } else {
          setUser({
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.email,
            slug: decoded.slug,
          });
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem('authToken', token);
      const decoded = jwtDecode<JWTPayload>(token);
      
      setUser({
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || decoded.email,
        slug: decoded.slug,
      });
    } catch (error) {
      console.error('Failed to decode token:', error);
      localStorage.removeItem('authToken');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
