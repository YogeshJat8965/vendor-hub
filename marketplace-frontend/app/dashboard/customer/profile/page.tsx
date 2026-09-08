'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { UploadService } from '@/lib/upload-service';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/customer/profile?email=${user?.email}`);
      const profileData = response.data;
      profileForm.reset({
        fullName: profileData.fullName || user?.name || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
      });
      setPhotoUrl(profileData.photoUrl || null);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
      // Use auth user data as fallback
      profileForm.reset({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      await apiClient.put('/customer/profile', {
        ...data,
        email: user?.email, // Keep original email as identifier
        photoUrl,
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    try {
      await apiClient.post('/auth/change-password', {
        email: user?.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setIsUploadingPhoto(true);
    try {
      const url = await UploadService.uploadProfilePhoto(file, user.email);
      setPhotoUrl(url);
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = () => {
    setPhotoUrl(null);
    window.dispatchEvent(new Event('profileUpdated'));
    toast.success('Profile photo removed');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.email) return;
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast.error('Please drop an image file');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const url = await UploadService.uploadProfilePhoto(files[0], user.email);
      setPhotoUrl(url);
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Profile Settings</h1>
          <p className="text-[#6B5E54] font-body">Manage your account information and preferences</p>
        </div>

        {/* Profile Photo */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardHeader className="border-b border-[#CDC0B0]/30 bg-[#FDFBF7]/50 rounded-t-3xl">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div
                className="relative"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Avatar className="w-36 h-36 border-4 border-[#CDC0B0] hover:border-[#9C8E82] transition-colors bg-[#FDFBF7] shadow-sm">
                  <AvatarImage src={photoUrl || undefined} />
                  <AvatarFallback className="bg-[#EEDDCC] text-[#2C2621] text-5xl font-heading">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {photoUrl && (
                  <button
                    onClick={handleDeletePhoto}
                    className="absolute top-0 right-0 w-6 h-6 bg-[#B85C5C] text-white rounded-full flex items-center justify-center hover:bg-[#A34F4F] shadow-warm-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={handlePhotoClick}
                  disabled={isUploadingPhoto}
                  className="border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] text-[#2C2621] rounded-xl font-body"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2 text-[#9C8E82]" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#9C8E82] mt-2 font-body">
                  JPG, PNG or WEBP. Max size 2MB. Drag & drop supported
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardHeader className="border-b border-[#CDC0B0]/30 bg-[#FDFBF7]/50 rounded-t-3xl">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="mb-2 font-body text-[#2C2621]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="fullName"
                    className={`pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${profileForm.formState.errors.fullName ? 'border-[#B85C5C]' : ''} disabled:bg-[#FDFBF7]/50 disabled:opacity-70`}
                    {...profileForm.register('fullName')}
                    disabled={!isEditing}
                  />
                </div>
                {profileForm.formState.errors.fullName && (
                  <p className="text-sm text-[#B85C5C] mt-1 font-body">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="mb-2 font-body text-[#2C2621]">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="email"
                      type="email"
                      className={`pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${profileForm.formState.errors.email ? 'border-[#B85C5C]' : ''} disabled:bg-[#FDFBF7]/50 disabled:opacity-70`}
                      {...profileForm.register('email')}
                      disabled
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-[#B85C5C] mt-1 font-body">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2 font-body text-[#2C2621]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      id="phone"
                      type="tel"
                      className={`pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${profileForm.formState.errors.phone ? 'border-[#B85C5C]' : ''} disabled:bg-[#FDFBF7]/50 disabled:opacity-70`}
                      {...profileForm.register('phone')}
                      disabled={!isEditing}
                    />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-[#B85C5C] mt-1 font-body">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="mb-2 font-body text-[#2C2621]">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="address"
                    className="pl-10 h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] disabled:bg-[#FDFBF7]/50 disabled:opacity-70"
                    {...profileForm.register('address')}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="mb-2 font-body text-[#2C2621]">City</Label>
                  <Input
                    id="city"
                    className="h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] disabled:bg-[#FDFBF7]/50 disabled:opacity-70"
                    {...profileForm.register('city')}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="mb-2 font-body text-[#2C2621]">State</Label>
                  <Input
                    id="state"
                    className="h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] disabled:bg-[#FDFBF7]/50 disabled:opacity-70"
                    {...profileForm.register('state')}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="mb-2 font-body text-[#2C2621]">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    className="h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] disabled:bg-[#FDFBF7]/50 disabled:opacity-70"
                    {...profileForm.register('zipCode')}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] touch-target rounded-xl font-body"
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
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile(); // Reset to original values
                      }}
                      className="touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] text-[#2C2621] rounded-xl font-body"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                    className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] touch-target rounded-xl font-body"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardHeader className="border-b border-[#CDC0B0]/30 bg-[#FDFBF7]/50 rounded-t-3xl">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="currentPassword" className="mb-2 font-body text-[#2C2621]">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`pl-10 pr-10 h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${passwordForm.formState.errors.currentPassword ? 'border-[#B85C5C]' : ''}`}
                    {...passwordForm.register('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#6B5E54]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-[#B85C5C] mt-1 font-body">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className="mb-2 font-body text-[#2C2621]">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className={`pl-10 pr-10 h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${passwordForm.formState.errors.newPassword ? 'border-[#B85C5C]' : ''}`}
                    {...passwordForm.register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#6B5E54]"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-[#B85C5C] mt-1 font-body">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="mb-2 font-body text-[#2C2621]">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`pl-10 pr-10 h-12 touch-target rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621] ${passwordForm.formState.errors.confirmPassword ? 'border-[#B85C5C]' : ''}`}
                    {...passwordForm.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#6B5E54]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-[#B85C5C] mt-1 font-body">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] text-[#2C2621] rounded-xl font-body"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>


        {/* Danger Zone */}
        <Card className="border-[#B85C5C]/30 bg-[#B85C5C]/5 rounded-3xl shadow-warm-sm">
          <CardHeader className="border-b border-[#B85C5C]/20 bg-white/50 rounded-t-3xl">
            <CardTitle className="text-[#B85C5C] font-heading text-xl">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium font-body text-[#2C2621] mb-1">Delete Account</h4>
                <p className="text-sm font-body text-[#B85C5C]/80">Permanently delete your account and all data</p>
              </div>
              <Button className="bg-[#B85C5C] hover:bg-[#A34F4F] text-white rounded-xl font-body">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
