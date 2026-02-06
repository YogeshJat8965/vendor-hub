'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { login, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      if (role === 'customer') router.push('/dashboard/customer');
      else if (role === 'vendor') router.push('/dashboard/vendor');
      else if (role === 'admin') router.push('/dashboard/admin');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      
      const token = response.data.token;
      login(token);
      
      toast.success('Login successful!');
      
      // Decode token to get user role for redirect
      const decoded = jwtDecode<any>(token);
      const userRole = decoded.role?.toLowerCase();
      
      // Redirect based on role
      if (userRole === 'customer') {
        router.push('/dashboard/customer');
      } else if (userRole === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold gradient-text">VendorHub</h1>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-600">
              {roleParam === 'vendor' 
                ? 'Sign in to your vendor account'
                : roleParam === 'customer'
                ? 'Sign in to find trusted service providers'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`pl-10 h-12 touch-target ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-12 touch-target ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg touch-target"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 touch-target"
            asChild
          >
            <Link href="/signup">Create an Account</Link>
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white text-center max-w-md"
        >
          <h2 className="text-4xl font-bold mb-6">Find Trusted Service Providers</h2>
          <p className="text-lg text-blue-100 mb-8">
            Connect with verified professionals for all your needs. Get quotes, read reviews, and hire with confidence.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Verified Vendors</h3>
                <p className="text-sm text-blue-100">All professionals are thoroughly vetted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Quick Quotes</h3>
                <p className="text-sm text-blue-100">Get responses within hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Trusted Reviews</h3>
                <p className="text-sm text-blue-100">Real feedback from real customers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
