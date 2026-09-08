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
import { AuthBackgroundVideo } from '@/components/auth/AuthBackgroundVideo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
        vendorType: 'SERVICE_PROVIDER',
        city: data.city,
        pincode: '',
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
            className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl p-8 sm:p-11 rounded-[2.5rem] shadow-2xl border border-[#CDC0B0]/40"
          >
            {/* Centered Header Title */}
            <div className="text-center mb-8">
              <p className="font-accent text-2xl sm:text-3xl text-[#C4975A] mb-1">Join the Community</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#2C2621]">
                Register Your VendorHub Account
              </h2>
            </div>

            {/* Tabs (Customer vs Professional) */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customer' | 'vendor')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-2 mb-8 bg-[#FDFBF7] p-0 rounded-2xl border border-[#CDC0B0]/60 h-14 items-center overflow-hidden">
                <TabsTrigger
                  value="customer"
                  className="h-11 px-4 font-body font-medium text-sm sm:text-base flex items-center justify-center rounded-xl text-[#6B5E54] hover:text-[#2C2621] data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] data-[state=active]:shadow-md transition-all duration-300 border-0 outline-none"
                >
                  Customer / Homeowner
                </TabsTrigger>
                <TabsTrigger
                  value="vendor"
                  className="h-11 px-4 font-body font-medium text-sm sm:text-base flex items-center justify-center rounded-xl text-[#6B5E54] hover:text-[#2C2621] data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] data-[state=active]:shadow-md transition-all duration-300 border-0 outline-none"
                >
                  Design Professional
                </TabsTrigger>
              </TabsList>

              {/* Customer Form */}
              <TabsContent value="customer">
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-6">
                  {/* Row 1: Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="customer-name" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="customer-name"
                          placeholder="John Doe"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.fullName ? 'border-red-500' : ''
                            }`}
                          {...customerForm.register('fullName')}
                        />
                      </div>
                      {customerForm.formState.errors.fullName && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{customerForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer-phone" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="customer-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.phone ? 'border-red-500' : ''
                            }`}
                          {...customerForm.register('phone')}
                        />
                      </div>
                      {customerForm.formState.errors.phone && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{customerForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email Address */}
                  <div>
                    <Label htmlFor="customer-email" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="john@example.com"
                        className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.email ? 'border-red-500' : ''
                          }`}
                        {...customerForm.register('email')}
                      />
                    </div>
                    {customerForm.formState.errors.email && (
                      <p className="text-xs text-red-500 mt-1.5 font-body">{customerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Row 3: Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="customer-password" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="customer-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-12 pr-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.password ? 'border-red-500' : ''
                            }`}
                          {...customerForm.register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {customerForm.formState.errors.password && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{customerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer-confirm-password" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="customer-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-12 pr-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${customerForm.formState.errors.confirmPassword ? 'border-red-500' : ''
                            }`}
                          {...customerForm.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {customerForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{customerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
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
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign Up as Customer</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Vendor Form */}
              <TabsContent value="vendor">
                <form onSubmit={vendorForm.handleSubmit(onVendorSubmit)} className="space-y-6">
                  {/* Row 1: Business Name & Owner Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="vendor-business" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Business Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-business"
                          placeholder="Studio Design Co."
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.businessName ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('businessName')}
                        />
                      </div>
                      {vendorForm.formState.errors.businessName && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.businessName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vendor-owner" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Owner / Lead Designer
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-owner"
                          placeholder="Jane Smith"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.ownerName ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('ownerName')}
                        />
                      </div>
                      {vendorForm.formState.errors.ownerName && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.ownerName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="vendor-email" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Business Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-email"
                          type="email"
                          placeholder="studio@example.com"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.email ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('email')}
                        />
                      </div>
                      {vendorForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vendor-phone" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.phone ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('phone')}
                        />
                      </div>
                      {vendorForm.formState.errors.phone && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: City & State */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="vendor-city" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        City
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-city"
                          placeholder="Mumbai"
                          className={`pl-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.city ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('city')}
                        />
                      </div>
                      {vendorForm.formState.errors.city && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vendor-state" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        State
                      </Label>
                      <Input
                        id="vendor-state"
                        placeholder="Maharashtra"
                        className={`h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.state ? 'border-red-500' : ''
                          }`}
                        {...vendorForm.register('state')}
                      />
                      {vendorForm.formState.errors.state && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="vendor-password" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-12 pr-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.password ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {vendorForm.formState.errors.password && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vendor-confirm-password" className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-[#2C2621]">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                        <Input
                          id="vendor-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-12 pr-12 h-14 bg-[#FDFBF7] border-[#CDC0B0]/70 text-[#2C2621] rounded-2xl text-base focus:border-[#C4975A] focus:ring-1 focus:ring-[#C4975A] ${vendorForm.formState.errors.confirmPassword ? 'border-red-500' : ''
                            }`}
                          {...vendorForm.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#2C2621] transition-colors p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {vendorForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5 font-body">{vendorForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
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
                        <span>Registering...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign Up as Professional</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Bottom Divider & Sign In Link */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#CDC0B0]/40" />
              </div>
              <div className="relative flex justify-center text-sm font-body">
                <span className="px-4 bg-white text-[#6B5E54]">Already have an account?</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 touch-target border-[#CDC0B0] text-[#2C2621] font-body rounded-2xl hover:bg-[#FDFBF7] hover:border-[#C4975A] transition-colors text-base"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#2C2621]">
          <div className="w-8 h-8 border-4 border-[#C4975A]/30 border-t-[#C4975A] rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
