'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Image from 'next/image';

const customerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const vendorSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CustomerFormData = z.infer<typeof customerSchema>;
type VendorFormData = z.infer<typeof vendorSchema>;

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'vendor') {
      setActiveTab('vendor');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      if (role === 'customer') router.push('/dashboard/customer');
      else if (role === 'vendor') router.push('/dashboard/vendor');
      else if (role === 'admin') router.push('/dashboard/admin');
    }
  }, [isAuthenticated, user, router]);

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const vendorForm = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onCustomerSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
      });
      
      const token = response.data.token;
      login(token);
      
      toast.success('Account created successfully! Welcome!');
      router.push('/dashboard/customer');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onVendorSubmit = async (data: VendorFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/vendor/signup', {
        storeName: data.businessName,
        businessName: data.businessName,
        email: data.email,
        password: data.password,
        mobile: data.phone || '',
        vendorType: 'SERVICE_PROVIDER', // Default type
        city: data.city,
        pincode: '', // We don't collect pincode in form, can be added later
        consentConfirmed: true,
      });
      
      const token = response.data.token;
      login(token);
      
      toast.success('Vendor registration successful!', {
        description: 'Your account is pending approval. You will be notified once approved.',
        duration: 5000,
      });
      
      router.push('/dashboard/vendor');
    } catch (error: any) {
      console.error('Vendor signup error:', error.response?.data || error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Vendor signup failed';
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
            <p className="font-accent text-2xl text-[#CDB79E] mb-1">Join the community</p>
            <h2 className="text-3xl font-heading font-bold text-[#2C2621]">
              Create Your Account
            </h2>
            <p className="text-[#6B5E54] font-body mt-2">Sign up to get started today</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customer' | 'vendor')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-4 mb-8 bg-transparent p-0">
              <TabsTrigger 
                value="customer" 
                className="h-12 px-6 font-body font-medium text-base flex items-center justify-center data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] data-[state=active]:shadow-warm-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#9C8E82] data-[state=inactive]:border data-[state=inactive]:border-[#CDC0B0] data-[state=inactive]:hover:border-[#9C8E82] transition-all duration-200 rounded-xl"
              >
                Customer
              </TabsTrigger>
              <TabsTrigger 
                value="vendor" 
                className="h-12 px-6 font-body font-medium text-base flex items-center justify-center data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] data-[state=active]:shadow-warm-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#9C8E82] data-[state=inactive]:border data-[state=inactive]:border-[#CDC0B0] data-[state=inactive]:hover:border-[#9C8E82] transition-all duration-200 rounded-xl"
              >
                Professional
              </TabsTrigger>
            </TabsList>

            {/* Customer Form */}
            <TabsContent value="customer">
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <Label htmlFor="customer-name" className="mb-2 font-body text-[#2C2621]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="customer-name"
                      placeholder="John Doe"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...customerForm.register('fullName')}
                    />
                  </div>
                  {customerForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-2 font-body">{customerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="customer-email" className="mb-2 font-body text-[#2C2621]">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="john@example.com"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...customerForm.register('email')}
                    />
                  </div>
                  {customerForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-2 font-body">{customerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="customer-phone" className="mb-2 font-body text-[#2C2621]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...customerForm.register('phone')}
                    />
                  </div>
                  {customerForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-2 font-body">{customerForm.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="customer-password" className="mb-2 font-body text-[#2C2621]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="customer-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-12 pr-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...customerForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {customerForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-2 font-body">{customerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="customer-confirm-password" className="mb-2 font-body text-[#2C2621]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="customer-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-12 pr-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...customerForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {customerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-2 font-body">{customerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] h-14 rounded-2xl font-body text-lg touch-target shadow-warm-md transition-all group mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#EEDDCC]/30 border-t-[#EEDDCC] rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Sign Up as Customer
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Vendor Form */}
            <TabsContent value="vendor">
              <form onSubmit={vendorForm.handleSubmit(onVendorSubmit)} className="space-y-5">
                {/* Business Name */}
                <div>
                  <Label htmlFor="vendor-business" className="mb-2 font-body text-[#2C2621]">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-business"
                      placeholder="Your Business Name"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.businessName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('businessName')}
                    />
                  </div>
                  {vendorForm.formState.errors.businessName && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.businessName.message}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <Label htmlFor="vendor-owner" className="mb-2 font-body text-[#2C2621]">Owner Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-owner"
                      placeholder="John Doe"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.ownerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('ownerName')}
                    />
                  </div>
                  {vendorForm.formState.errors.ownerName && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.ownerName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="vendor-email" className="mb-2 font-body text-[#2C2621]">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-email"
                      type="email"
                      placeholder="business@example.com"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('email')}
                    />
                  </div>
                  {vendorForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="vendor-phone" className="mb-2 font-body text-[#2C2621]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('phone')}
                    />
                  </div>
                  {vendorForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor-city" className="mb-2 font-body text-[#2C2621]">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                      <Input
                        id="vendor-city"
                        placeholder="New York"
                        className={`pl-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        {...vendorForm.register('city')}
                      />
                    </div>
                    {vendorForm.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vendor-state" className="mb-2 font-body text-[#2C2621]">State</Label>
                    <Input
                      id="vendor-state"
                      placeholder="NY"
                      className={`h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('state')}
                    />
                    {vendorForm.formState.errors.state && (
                      <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="vendor-password" className="mb-2 font-body text-[#2C2621]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-12 pr-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {vendorForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="vendor-confirm-password" className="mb-2 font-body text-[#2C2621]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="vendor-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-12 pr-12 h-14 touch-target bg-[#FDFBF7] border-[#CDC0B0] text-[#2C2621] rounded-2xl focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...vendorForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {vendorForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-2 font-body">{vendorForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] h-14 rounded-2xl font-body text-lg touch-target shadow-warm-md transition-all group mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#EEDDCC]/30 border-t-[#EEDDCC] rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Sign Up as Professional
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#CDC0B0]" />
            </div>
            <div className="relative flex justify-center text-sm font-body">
              <span className="px-4 bg-white text-[#9C8E82]">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-14 touch-target border-[#CDC0B0] text-[#2C2621] font-body rounded-2xl hover:bg-[#FDFBF7] hover:border-[#9C8E82]" 
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#2C2621]">
        <Image 
          src="https://images.unsplash.com/photo-1593696140826-c38b12252276?auto=format&fit=crop&q=80&w=1200"
          alt="Elegant architecture design"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2621] via-transparent to-transparent" />
        
        <div className="absolute bottom-16 left-12 right-12 text-[#FDFBF7]">
          <h3 className="font-heading text-4xl font-bold mb-4">
            Showcase your craft.<br />
            Connect with clients.
          </h3>
          <p className="font-body text-[#EEDDCC] text-lg max-w-md leading-relaxed">
            Join the most exclusive network of interior designers and architects.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
