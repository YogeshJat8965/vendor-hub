'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Save, Plus, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { UploadService } from '@/lib/upload-service';

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

export default function VendorStorefrontPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [vendorSlug, setVendorSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StorefrontFormData>({
    resolver: zodResolver(storefrontSchema),
    defaultValues: {
      businessName: '',
      category: '',
      description: '',
      longDescription: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      yearsInBusiness: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchVendorProfile();
    }
  }, [user]);

  const fetchVendorProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/vendor/profile?email=${user?.email}`);
      const profileData = response.data;
      
      form.reset({
        businessName: profileData.businessName || '',
        category: profileData.vendorType || '',
        description: profileData.description || '',
        longDescription: profileData.longDescription || '',
        phone: profileData.phone || '',
        email: profileData.email || user?.email || '',
        website: profileData.website || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
        yearsInBusiness: profileData.yearsInBusiness || '',
      });
      
      setServices(profileData.services || []);
      setGallery(profileData.gallery || []);
      setVendorSlug(profileData.slug || '');
      setLogoUrl(profileData.logoUrl || null);
      setBannerUrl(profileData.bannerUrl || null);
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: StorefrontFormData) => {
    setIsUpdating(true);
    try {
      await apiClient.put('/vendor/profile', {
        ...data,
        email: user?.email,
        services,
        gallery,
        logoUrl,
        bannerUrl,
      });
      toast.success('Profile updated successfully');
      fetchVendorProfile();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setIsUploadingLogo(true);
    try {
      const url = await UploadService.uploadVendorLogo(file, user.email);
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setIsUploadingBanner(true);
    try {
      const url = await UploadService.uploadVendorBanner(file, user.email);
      setBannerUrl(url);
      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Banner upload error:', error);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.email) return;

    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await UploadService.uploadVendorGalleryImage(files[i], user.email);
        uploadedUrls.push(url);
      }
      
      setGallery(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Gallery upload error:', error);
      // Partial success - some images may have uploaded
      if (uploadedUrls.length > 0) {
        setGallery(prev => [...prev, ...uploadedUrls]);
        toast.info(`${uploadedUrls.length} image(s) uploaded before error`);
      }
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = () => {
    setLogoUrl(null);
    toast.success('Logo removed');
  };

  const handleDeleteBanner = () => {
    setBannerUrl(null);
    toast.success('Banner removed');
  };

  const handleDrop = async (e: React.DragEvent, type: 'logo' | 'banner' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.email) return;
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast.error('Please drop image files only');
      return;
    }

    if (type === 'logo') {
      setIsUploadingLogo(true);
      try {
        const url = await UploadService.uploadVendorLogo(files[0], user.email);
        setLogoUrl(url);
        toast.success('Logo uploaded successfully');
      } catch (error) {
        console.error('Logo upload error:', error);
      } finally {
        setIsUploadingLogo(false);
      }
    } else if (type === 'banner') {
      setIsUploadingBanner(true);
      try {
        const url = await UploadService.uploadVendorBanner(files[0], user.email);
        setBannerUrl(url);
        toast.success('Banner uploaded successfully');
      } catch (error) {
        console.error('Banner upload error:', error);
      } finally {
        setIsUploadingBanner(false);
      }
    } else if (type === 'gallery') {
      setIsUploadingGallery(true);
      const uploadedUrls: string[] = [];
      
      try {
        for (const file of files) {
          const url = await UploadService.uploadVendorGalleryImage(file, user.email);
          uploadedUrls.push(url);
        }
        
        setGallery(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      } catch (error) {
        console.error('Gallery upload error:', error);
        if (uploadedUrls.length > 0) {
          setGallery(prev => [...prev, ...uploadedUrls]);
          toast.info(`${uploadedUrls.length} image(s) uploaded before error`);
        }
      } finally {
        setIsUploadingGallery(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addService = async () => {
    if (newService.trim()) {
      const updatedServices = [...services, newService.trim()];
      setServices(updatedServices);
      setNewService('');
      
      try {
        await apiClient.put('/vendor/profile', {
          email: user?.email,
          services: updatedServices,
        });
        toast.success('Service added');
      } catch (error) {
        setServices(services);
        toast.error('Failed to add service');
      }
    }
  };

  const removeService = async (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    const oldServices = [...services];
    setServices(updatedServices);
    
    try {
      await apiClient.put('/vendor/profile', {
        email: user?.email,
        services: updatedServices,
      });
      toast.success('Service removed');
    } catch (error) {
      setServices(oldServices);
      toast.error('Failed to remove service');
    }
  };

  const removeGalleryImage = async (index: number) => {
    const updatedGallery = gallery.filter((_, i) => i !== index);
    const oldGallery = [...gallery];
    setGallery(updatedGallery);
    
    try {
      await apiClient.put('/vendor/profile', {
        email: user?.email,
        gallery: updatedGallery,
      });
      toast.success('Image removed');
    } catch (error) {
      setGallery(oldGallery);
      toast.error('Failed to remove image');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] rounded-3xl p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Edit Storefront</h1>
        <p className="text-[#6B5E54] font-body">Update your business profile and public storefront</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Banner */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Logo */}
            <div>
              <Label className="mb-3 block font-body font-medium text-[#2C2621]">Business Logo</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div 
                  className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#EEDDCC] flex items-center justify-center text-[#2C2621] text-4xl font-heading font-bold border-2 border-dashed border-[#CDC0B0] hover:border-[#9C8E82] transition-colors"
                  onDrop={(e) => handleDrop(e, 'logo')}
                  onDragOver={handleDragOver}
                >
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="absolute top-1 right-1 w-6 h-6 bg-[#B85C5C] text-white rounded-full flex items-center justify-center hover:bg-[#A04D4D] opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span>{form.watch('businessName')?.charAt(0) || 'B'}</span>
                  )}
                </div>
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="touch-target rounded-xl border-[#CDC0B0] hover:bg-[#FDFBF7] text-[#2C2621] font-body"
                    onClick={handleLogoClick}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  <p className="text-xs font-body text-[#9C8E82] mt-2">Square image, max 2MB. Drag & drop or click to upload</p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <Label className="mb-3 block font-body font-medium text-[#2C2621]">Banner Image</Label>
              <div 
                className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-[#FDFBF7] border-2 border-dashed border-[#CDC0B0] hover:border-[#9C8E82] transition-colors group"
                onDrop={(e) => handleDrop(e, 'banner')}
                onDragOver={handleDragOver}
              >
                {bannerUrl && (
                  <>
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleDeleteBanner}
                      className="absolute top-4 right-4 w-9 h-9 bg-white border border-[#B85C5C]/20 text-[#B85C5C] rounded-full flex items-center justify-center hover:bg-[#B85C5C] hover:text-white shadow-sm z-10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {!bannerUrl && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9C8E82]">
                     <Camera className="w-10 h-10 mb-2 opacity-50" />
                     <p className="font-body text-sm">Drag & drop banner image here</p>
                   </div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="absolute bottom-4 right-4 touch-target bg-white/90 backdrop-blur-sm text-[#2C2621] hover:bg-white rounded-xl shadow-warm-sm border border-[#CDC0B0]/30 font-body"
                  onClick={handleBannerClick}
                  disabled={isUploadingBanner}
                >
                  {isUploadingBanner ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {bannerUrl ? 'Change Banner' : 'Upload Banner'}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs font-body text-[#9C8E82] mt-2">1920x600px recommended, max 5MB. Drag & drop supported</p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessName" className="mb-2 font-body text-[#2C2621] font-medium">Business Name *</Label>
                <Input
                  id="businessName"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.businessName ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('businessName')}
                />
                {form.formState.errors.businessName && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.businessName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="category" className="mb-2 font-body text-[#2C2621] font-medium">Category *</Label>
                <Input
                  id="category"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.category ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('category')}
                />
                {form.formState.errors.category && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 font-body text-[#2C2621] font-medium">Short Description *</Label>
              <Textarea
                id="description"
                className={`min-h-[100px] rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.description ? 'border-[#B85C5C]' : ''}`}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="longDescription" className="mb-2 font-body text-[#2C2621] font-medium">Detailed Description *</Label>
              <Textarea
                id="longDescription"
                className={`min-h-[160px] rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.longDescription ? 'border-[#B85C5C]' : ''}`}
                placeholder="Tell customers about your business, services, experience, and what makes you unique..."
                {...form.register('longDescription')}
              />
              {form.formState.errors.longDescription && (
                <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.longDescription.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yearsInBusiness" className="mb-2 font-body text-[#2C2621] font-medium">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                className="h-12 rounded-xl w-full sm:w-1/3 border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
                {...form.register('yearsInBusiness')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="mb-2 font-body text-[#2C2621] font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.phone ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 font-body text-[#2C2621] font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.email ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="mb-2 font-body text-[#2C2621] font-medium">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.yourbusiness.com"
                className="h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
                {...form.register('website')}
              />
            </div>

            <div>
              <Label htmlFor="address" className="mb-2 font-body text-[#2C2621] font-medium">Street Address *</Label>
              <Input
                id="address"
                className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.address ? 'border-[#B85C5C]' : ''}`}
                {...form.register('address')}
              />
              {form.formState.errors.address && (
                <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="city" className="mb-2 font-body text-[#2C2621] font-medium">City *</Label>
                <Input
                  id="city"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.city ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('city')}
                />
                {form.formState.errors.city && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state" className="mb-2 font-body text-[#2C2621] font-medium">State *</Label>
                <Input
                  id="state"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.state ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('state')}
                />
                {form.formState.errors.state && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="zipCode" className="mb-2 font-body text-[#2C2621] font-medium">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  className={`h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${form.formState.errors.zipCode ? 'border-[#B85C5C]' : ''}`}
                  {...form.register('zipCode')}
                />
                {form.formState.errors.zipCode && (
                  <p className="text-sm font-body text-[#B85C5C] mt-1">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Services Offered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add a service (e.g. Living Room Design)..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                className="h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
              />
              <Button type="button" onClick={addService} className="h-12 w-12 rounded-xl bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] flex-shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#EEDDCC] text-[#2C2621] px-4 py-2 rounded-xl font-body font-medium"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="hover:text-[#B85C5C] transition-colors ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm font-body text-[#9C8E82]">No services added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Gallery</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {gallery.length > 0 ? (
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border-2 border-dashed border-[#CDC0B0] hover:border-[#9C8E82] rounded-2xl transition-colors bg-[#FDFBF7]/50"
                onDrop={(e) => handleDrop(e, 'gallery')}
                onDragOver={handleDragOver}
              >
                {gallery.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl bg-[#FDFBF7] overflow-hidden group shadow-sm border border-[#CDC0B0]/30">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white border border-[#B85C5C]/20 text-[#B85C5C] rounded-full flex items-center justify-center hover:bg-[#B85C5C] hover:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  disabled={isUploadingGallery}
                  className="aspect-square rounded-xl border-2 border-dashed border-[#CDC0B0] bg-white flex flex-col items-center justify-center hover:border-[#C4975A] hover:bg-[#C4975A]/5 text-[#9C8E82] transition-all disabled:opacity-50"
                >
                  {isUploadingGallery ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <span className="text-xs font-body font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-2" />
                      <span className="text-xs font-body font-medium">Add Photo</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div 
                className="text-center py-16 px-4 border-2 border-dashed border-[#CDC0B0] bg-[#FDFBF7] rounded-2xl hover:border-[#9C8E82] transition-colors"
                onDrop={(e) => handleDrop(e, 'gallery')}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#CDC0B0]/50 shadow-sm">
                  <Camera className="h-8 w-8 text-[#CDB79E]" />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#2C2621] mb-2">Upload Gallery Photos</h3>
                <p className="font-body text-[#6B5E54] mb-1">Drag & drop images here</p>
                <p className="text-sm font-body text-[#9C8E82] mb-6">or click the button below to browse</p>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleGallerySelect}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  onClick={handleGalleryClick} 
                  variant="outline"
                  className="rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-white font-body bg-white shadow-sm"
                  disabled={isUploadingGallery}
                >
                  {isUploadingGallery ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photos
                    </>
                  )}
                </Button>
                <p className="text-xs font-body text-[#9C8E82] mt-4">Select multiple images. Max 3MB each, 1200x1200px recommended</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1 sm:flex-none bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl font-body font-medium shadow-warm-md hover:shadow-warm-lg transition-all h-14 px-8"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving Changes...
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
            className="flex-1 sm:flex-none rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body h-14 px-8 bg-white"
            onClick={() => window.open(`/vendors/${vendorSlug || 'preview'}`, '_blank')}
          >
            Preview Storefront
          </Button>
        </div>
      </form>
    </div>
  );
}
