'use client';

import { useState, useEffect } from 'react';
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

const customerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CustomerFormData = z.infer<typeof customerSchema>;
type VendorFormData = z.infer<typeof vendorSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'vendor') {
      setActiveTab('vendor');
    }
  }, [searchParams]);

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const vendorForm = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onCustomerSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      console.log('Customer signup data:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Store JWT token and redirect
      router.push('/login');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onVendorSubmit = async (data: VendorFormData) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      console.log('Vendor signup data:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Store JWT token and redirect
      router.push('/login');
    } catch (error) {
      console.error('Signup error:', error);
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-600">Join our community today</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customer' | 'vendor')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 touch-target">
              <TabsTrigger value="customer" className="touch-target">Customer</TabsTrigger>
              <TabsTrigger value="vendor" className="touch-target">Vendor</TabsTrigger>
            </TabsList>

            {/* Customer Form */}
            <TabsContent value="customer">
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <Label htmlFor="customer-name" className="mb-2">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="customer-name"
                      placeholder="John Doe"
                      className={`pl-10 h-12 touch-target ${customerForm.formState.errors.fullName ? 'border-red-500' : ''}`}
                      {...customerForm.register('fullName')}
                    />
                  </div>
                  {customerForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{customerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="customer-email" className="mb-2">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="john@example.com"
                      className={`pl-10 h-12 touch-target ${customerForm.formState.errors.email ? 'border-red-500' : ''}`}
                      {...customerForm.register('email')}
                    />
                  </div>
                  {customerForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{customerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="customer-phone" className="mb-2">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className={`pl-10 h-12 touch-target ${customerForm.formState.errors.phone ? 'border-red-500' : ''}`}
                      {...customerForm.register('phone')}
                    />
                  </div>
                  {customerForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{customerForm.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="customer-password" className="mb-2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="customer-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-12 touch-target ${customerForm.formState.errors.password ? 'border-red-500' : ''}`}
                      {...customerForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {customerForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{customerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="customer-confirm-password" className="mb-2">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="customer-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-12 touch-target ${customerForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...customerForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {customerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{customerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg touch-target mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Sign Up as Customer
                      <ArrowRight className="ml-2 w-5 h-5" />
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
                  <Label htmlFor="vendor-business" className="mb-2">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-business"
                      placeholder="Your Business Name"
                      className={`pl-10 h-12 touch-target ${vendorForm.formState.errors.businessName ? 'border-red-500' : ''}`}
                      {...vendorForm.register('businessName')}
                    />
                  </div>
                  {vendorForm.formState.errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.businessName.message}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <Label htmlFor="vendor-owner" className="mb-2">Owner Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-owner"
                      placeholder="John Doe"
                      className={`pl-10 h-12 touch-target ${vendorForm.formState.errors.ownerName ? 'border-red-500' : ''}`}
                      {...vendorForm.register('ownerName')}
                    />
                  </div>
                  {vendorForm.formState.errors.ownerName && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.ownerName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="vendor-email" className="mb-2">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-email"
                      type="email"
                      placeholder="business@example.com"
                      className={`pl-10 h-12 touch-target ${vendorForm.formState.errors.email ? 'border-red-500' : ''}`}
                      {...vendorForm.register('email')}
                    />
                  </div>
                  {vendorForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="vendor-phone" className="mb-2">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className={`pl-10 h-12 touch-target ${vendorForm.formState.errors.phone ? 'border-red-500' : ''}`}
                      {...vendorForm.register('phone')}
                    />
                  </div>
                  {vendorForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor-city" className="mb-2">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="vendor-city"
                        placeholder="New York"
                        className={`pl-10 h-12 touch-target ${vendorForm.formState.errors.city ? 'border-red-500' : ''}`}
                        {...vendorForm.register('city')}
                      />
                    </div>
                    {vendorForm.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vendor-state" className="mb-2">State</Label>
                    <Input
                      id="vendor-state"
                      placeholder="NY"
                      className={`h-12 touch-target ${vendorForm.formState.errors.state ? 'border-red-500' : ''}`}
                      {...vendorForm.register('state')}
                    />
                    {vendorForm.formState.errors.state && (
                      <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="vendor-password" className="mb-2">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-12 touch-target ${vendorForm.formState.errors.password ? 'border-red-500' : ''}`}
                      {...vendorForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {vendorForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="vendor-confirm-password" className="mb-2">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="vendor-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-12 touch-target ${vendorForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...vendorForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {vendorForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{vendorForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg touch-target mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Sign Up as Vendor
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Button variant="outline" size="lg" className="w-full h-12 touch-target" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white text-center max-w-md"
        >
          <h2 className="text-4xl font-bold mb-6">Join VendorHub Today</h2>
          <p className="text-lg text-blue-100 mb-8">
            Whether you're looking for services or offering them, VendorHub connects you with the right people.
          </p>
          <div className="space-y-4 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-1">For Customers</h3>
              <p className="text-sm text-blue-100">Find verified professionals, get quotes, and hire with confidence</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-1">For Vendors</h3>
              <p className="text-sm text-blue-100">Grow your business, connect with customers, and build your reputation</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
