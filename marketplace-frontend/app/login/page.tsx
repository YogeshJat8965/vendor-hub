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
import Image from 'next/image';

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
    <div className="min-h-screen flex bg-[#FDFBF7]">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Decorative subtle background blobs */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#EEDDCC]/50 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#CDC0B0]/30 rounded-full blur-[60px] -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-warm-lg border border-[#CDC0B0]/40"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-10">
            <h1 className="text-3xl font-heading font-bold text-[#2C2621]">VendorHub.</h1>
          </Link>

          {/* Title */}
          <div className="mb-10">
            <p className="font-accent text-2xl text-[#CDB79E] mb-1">Welcome Back</p>
            <h2 className="text-3xl font-heading font-bold text-[#2C2621]">
              Sign in to your account
            </h2>
            <p className="text-[#6B5E54] font-body mt-2">
              {roleParam === 'vendor' 
                ? 'Manage your professional design portfolio'
                : roleParam === 'customer'
                ? 'Find your perfect design partner'
                : 'Continue your journey with us'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 font-body text-[#2C2621]">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-2 font-body">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="font-body text-[#2C2621]">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#CDB79E] hover:text-[#2C2621] font-body transition-colors"
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
                  className={`pl-12 pr-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-2 font-body">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] h-14 rounded-2xl font-body text-lg touch-target shadow-warm-md transition-all group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#EEDDCC]/30 border-t-[#EEDDCC] rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#CDC0B0]" />
            </div>
            <div className="relative flex justify-center text-sm font-body">
              <span className="px-4 bg-white text-[#9C8E82]">New to VendorHub?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 touch-target border-[#CDC0B0] text-[#2C2621] font-body rounded-2xl hover:bg-[#FDFBF7] hover:border-[#9C8E82]"
            asChild
          >
            <Link href="/signup">Create an Account</Link>
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#2C2621]">
        <Image 
          src="https://images.unsplash.com/photo-1616487625407-7ce1b2dc8978?auto=format&fit=crop&q=80&w=1200"
          alt="Japandi Interior Design"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2621] via-transparent to-transparent" />
        
        <div className="absolute bottom-16 left-12 right-12 text-[#FDFBF7]">
          <h3 className="font-heading text-4xl font-bold mb-4">
            Curated spaces.<br />
            Elevated living.
          </h3>
          <p className="font-body text-[#EEDDCC] text-lg max-w-md leading-relaxed">
            Join thousands of homeowners and professionals shaping the future of interior design.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
