'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Save, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const storefrontSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  longDescription: z.string().min(50, 'Detailed description must be at least 50 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  website: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  yearsInBusiness: z.string().optional(),
});

type StorefrontFormData = z.infer<typeof storefrontSchema>;

// Mock data
const mockStorefront = {
  businessName: 'Johns Plumbing Services',
  category: 'Plumbing',
  description: 'Professional plumbing services with over 15 years of experience serving the New York area.',
  longDescription: 'We are a family-owned business committed to providing top-quality plumbing services to our community. Our team of licensed and insured plumbers brings expertise, professionalism, and dedication to every job.',
  phone: '(555) 123-4567',
  email: 'contact@johnsplumbing.com',
  website: 'www.johnsplumbing.com',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  yearsInBusiness: '15',
  logo: null,
  banner: null,
  gallery: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
  services: ['Emergency Repairs', 'Installation', 'Maintenance'],
};

export default function VendorStorefrontPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [services, setServices] = useState(mockStorefront.services);
  const [newService, setNewService] = useState('');

  const form = useForm<StorefrontFormData>({
    resolver: zodResolver(storefrontSchema),
    defaultValues: mockStorefront,
  });

  const onSubmit = async (data: StorefrontFormData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update storefront
      console.log('Update storefront:', { ...data, services });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = () => {
    // TODO: Implement logo upload
    console.log('Upload logo');
  };

  const handleBannerUpload = () => {
    // TODO: Implement banner upload
    console.log('Upload banner');
  };

  const handleGalleryUpload = () => {
    // TODO: Implement gallery upload
    console.log('Upload gallery image');
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Storefront</h1>
        <p className="text-gray-600">Update your business profile and public storefront</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Banner */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div>
              <Label className="mb-2">Business Logo</Label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {mockStorefront.businessName.charAt(0)}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="touch-target"
                    onClick={handleLogoUpload}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Square image, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <Label className="mb-2">Banner Image</Label>
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden">
                <Button
                  type="button"
                  variant="secondary"
                  className="absolute bottom-4 right-4 touch-target"
                  onClick={handleBannerUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">1200x400px recommended, max 5MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessName" className="mb-2">Business Name *</Label>
                <Input
                  id="businessName"
                  className={`h-12 touch-target ${form.formState.errors.businessName ? 'border-red-500' : ''}`}
                  {...form.register('businessName')}
                />
                {form.formState.errors.businessName && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.businessName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="category" className="mb-2">Category *</Label>
                <Input
                  id="category"
                  className={`h-12 touch-target ${form.formState.errors.category ? 'border-red-500' : ''}`}
                  {...form.register('category')}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">Short Description *</Label>
              <Textarea
                id="description"
                className={`min-h-24 touch-target ${form.formState.errors.description ? 'border-red-500' : ''}`}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="longDescription" className="mb-2">Detailed Description *</Label>
              <Textarea
                id="longDescription"
                className={`min-h-32 touch-target ${form.formState.errors.longDescription ? 'border-red-500' : ''}`}
                placeholder="Tell customers about your business, services, experience, and what makes you unique..."
                {...form.register('longDescription')}
              />
              {form.formState.errors.longDescription && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.longDescription.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yearsInBusiness" className="mb-2">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                className="h-12 touch-target"
                {...form.register('yearsInBusiness')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="mb-2">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  className={`h-12 touch-target ${form.formState.errors.phone ? 'border-red-500' : ''}`}
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  className={`h-12 touch-target ${form.formState.errors.email ? 'border-red-500' : ''}`}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="mb-2">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="www.yourbusiness.com"
                className="h-12 touch-target"
                {...form.register('website')}
              />
            </div>

            <div>
              <Label htmlFor="address" className="mb-2">Street Address *</Label>
              <Input
                id="address"
                className={`h-12 touch-target ${form.formState.errors.address ? 'border-red-500' : ''}`}
                {...form.register('address')}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="city" className="mb-2">City *</Label>
                <Input
                  id="city"
                  className={`h-12 touch-target ${form.formState.errors.city ? 'border-red-500' : ''}`}
                  {...form.register('city')}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state" className="mb-2">State *</Label>
                <Input
                  id="state"
                  className={`h-12 touch-target ${form.formState.errors.state ? 'border-red-500' : ''}`}
                  {...form.register('state')}
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="zipCode" className="mb-2">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  className={`h-12 touch-target ${form.formState.errors.zipCode ? 'border-red-500' : ''}`}
                  {...form.register('zipCode')}
                />
                {form.formState.errors.zipCode && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a service..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                className="h-12 touch-target"
              />
              <Button type="button" onClick={addService} className="touch-target">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mockStorefront.gallery.map((_, index) => (
                <div key={index} className="relative aspect-square rounded-lg bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleGalleryUpload}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Add Image</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="touch-target"
            onClick={() => window.open(`/vendors/${mockStorefront.businessName.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
          >
            Preview Storefront
          </Button>
        </div>
      </form>
    </div>
  );
}
