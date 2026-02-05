'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
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

// Mock user data - will be replaced with API
const mockUser = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  avatar: null,
};

export default function CustomerProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: mockUser,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update profile
      console.log('Update profile:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to change password
      console.log('Change password');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      passwordForm.reset();
      // Show success message
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    console.log('Upload photo');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={mockUser.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl">
                {mockUser.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                className="touch-target"
                onClick={handlePhotoUpload}
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="mb-2">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  className={`pl-10 h-12 touch-target ${profileForm.formState.errors.fullName ? 'border-red-500' : ''}`}
                  {...profileForm.register('fullName')}
                />
              </div>
              {profileForm.formState.errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="mb-2">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className={`pl-10 h-12 touch-target ${profileForm.formState.errors.email ? 'border-red-500' : ''}`}
                    {...profileForm.register('email')}
                  />
                </div>
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    className={`pl-10 h-12 touch-target ${profileForm.formState.errors.phone ? 'border-red-500' : ''}`}
                    {...profileForm.register('phone')}
                  />
                </div>
                {profileForm.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="mb-2">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="address"
                  className="pl-10 h-12 touch-target"
                  {...profileForm.register('address')}
                />
              </div>
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="city" className="mb-2">City</Label>
                <Input
                  id="city"
                  className="h-12 touch-target"
                  {...profileForm.register('city')}
                />
              </div>
              <div>
                <Label htmlFor="state" className="mb-2">State</Label>
                <Input
                  id="state"
                  className="h-12 touch-target"
                  {...profileForm.register('state')}
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="mb-2">ZIP Code</Label>
                <Input
                  id="zipCode"
                  className="h-12 touch-target"
                  {...profileForm.register('zipCode')}
                />
              </div>
            </div>

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
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword" className="mb-2">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 h-12 touch-target ${passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}`}
                  {...passwordForm.register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="mb-2">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 h-12 touch-target ${passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}`}
                  {...passwordForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="mb-2">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 h-12 touch-target ${passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...passwordForm.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="touch-target"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive quote updates and messages via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Get urgent updates via text message</p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" className="touch-target">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
