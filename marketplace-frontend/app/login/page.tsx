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
import { AuthBackgroundVideo } from '@/components/auth/AuthBackgroundVideo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
    <>
      <Header />
      <main className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6">
        {/* 2 Background Video Slideshow */}
        <AuthBackgroundVideo />

        {/* Main Centered Content Form (Spacious Luxury Card) */}
        <div className="relative z-30 w-full flex justify-center items-center my-auto">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-2xl p-8 sm:p-11 rounded-[2.5rem] shadow-2xl border border-[#CDC0B0]/40"
          >
            {/* Centered Header Title */}
            <div className="text-center mb-8">
              <p className="font-accent text-2xl sm:text-3xl text-[#C4975A] mb-1">Welcome Back</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#2C2621]">
                Sign in to your account
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] font-body ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 font-body">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#C4975A] hover:text-[#2C2621] font-body font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-12 pr-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] font-body ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 font-body">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#2C2621] hover:bg-[#C4975A] text-white h-14 rounded-2xl font-body font-medium text-lg touch-target shadow-xl hover:shadow-2xl transition-all duration-300 group mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#CDC0B0]/40" />
              </div>
              <div className="relative flex justify-center text-sm font-body">
                <span className="px-4 bg-white text-[#6B5E54]">New to VendorHub?</span>
              </div>
            </div>

            {/* Create Account Link */}
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 touch-target border-[#CDC0B0] text-[#2C2621] font-body rounded-2xl hover:bg-[#FDFBF7] hover:border-[#C4975A] transition-colors text-base"
              asChild
            >
              <Link href="/signup">Create an Account</Link>
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#2C2621]">
          <div className="w-8 h-8 border-4 border-[#C4975A]/30 border-t-[#C4975A] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
