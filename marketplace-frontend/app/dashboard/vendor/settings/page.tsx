'use client';

import { useState } from 'react';
import { Clock, Mail, Phone, Globe, Bell, MapPin, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const settingsSchema = z.object({
  contactPhone: z.string().min(10, 'Valid phone number required'),
  contactEmail: z.string().email('Valid email required'),
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  serviceRadius: z.string().min(1, 'Service radius is required'),
  cities: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const mockSettings = {
  contactPhone: '(555) 123-4567',
  contactEmail: 'contact@johnsplumbing.com',
  website: 'www.johnsplumbing.com',
  facebook: 'facebook.com/johnsplumbing',
  instagram: '@johnsplumbing',
  twitter: '@johnsplumbing',
  serviceRadius: '25',
  cities: 'New York, Brooklyn, Queens, Manhattan',
};

const mockOperatingHours = [
  { day: 'Monday', open: '08:00', close: '18:00', isOpen: true },
  { day: 'Tuesday', open: '08:00', close: '18:00', isOpen: true },
  { day: 'Wednesday', open: '08:00', close: '18:00', isOpen: true },
  { day: 'Thursday', open: '08:00', close: '18:00', isOpen: true },
  { day: 'Friday', open: '08:00', close: '18:00', isOpen: true },
  { day: 'Saturday', open: '09:00', close: '15:00', isOpen: true },
  { day: 'Sunday', open: '00:00', close: '00:00', isOpen: false },
];

export default function VendorSettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [operatingHours, setOperatingHours] = useState(mockOperatingHours);
  const [notifications, setNotifications] = useState({
    emailQuotes: true,
    smsQuotes: true,
    emailReviews: true,
    smsReviews: false,
    emailMessages: true,
    smsMessages: true,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mockSettings,
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update settings
      console.log('Update settings:', { ...data, operatingHours, notifications });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOperatingHours = (index: number, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  const handleDeactivate = () => {
    // TODO: Implement deactivation
    console.log('Deactivate listing');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Delete account');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Business Settings</h1>
        <p className="text-gray-600">Manage your business configuration and preferences</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactPhone" className="mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  className={`h-12 touch-target ${form.formState.errors.contactPhone ? 'border-red-500' : ''}`}
                  {...form.register('contactPhone')}
                />
                {form.formState.errors.contactPhone && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactPhone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactEmail" className="mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  className={`h-12 touch-target ${form.formState.errors.contactEmail ? 'border-red-500' : ''}`}
                  {...form.register('contactEmail')}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="www.yourbusiness.com"
                className="h-12 touch-target"
                {...form.register('website')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="facebook" className="mb-2">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="facebook.com/yourbusiness"
                  className="h-12 touch-target"
                  {...form.register('facebook')}
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="mb-2">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@yourbusiness"
                  className="h-12 touch-target"
                  {...form.register('instagram')}
                />
              </div>
              <div>
                <Label htmlFor="twitter" className="mb-2">Twitter/X</Label>
                <Input
                  id="twitter"
                  placeholder="@yourbusiness"
                  className="h-12 touch-target"
                  {...form.register('twitter')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operatingHours.map((schedule, index) => (
                <div key={schedule.day} className="flex items-center gap-4">
                  <div className="w-28">
                    <span className="font-medium">{schedule.day}</span>
                  </div>
                  <Switch
                    checked={schedule.isOpen}
                    onCheckedChange={(checked) => updateOperatingHours(index, 'isOpen', checked)}
                  />
                  {schedule.isOpen ? (
                    <>
                      <Input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => updateOperatingHours(index, 'open', e.target.value)}
                        className="w-32 h-10"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => updateOperatingHours(index, 'close', e.target.value)}
                        className="w-32 h-10"
                      />
                    </>
                  ) : (
                    <span className="text-gray-500 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="serviceRadius" className="mb-2">Service Radius (miles) *</Label>
              <Select
                value={form.watch('serviceRadius')}
                onValueChange={(value) => form.setValue('serviceRadius', value)}
              >
                <SelectTrigger className="h-12 touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cities" className="mb-2">Cities/Areas Served</Label>
              <Input
                id="cities"
                placeholder="New York, Brooklyn, Queens..."
                className="h-12 touch-target"
                {...form.register('cities')}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of cities</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Quote Requests (Email)</Label>
                  <p className="text-sm text-gray-500">Receive email when customers request quotes</p>
                </div>
                <Switch
                  checked={notifications.emailQuotes}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailQuotes: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Quote Requests (SMS)</Label>
                  <p className="text-sm text-gray-500">Receive SMS for urgent quote requests</p>
                </div>
                <Switch
                  checked={notifications.smsQuotes}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsQuotes: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Reviews (Email)</Label>
                  <p className="text-sm text-gray-500">Get notified about customer reviews</p>
                </div>
                <Switch
                  checked={notifications.emailReviews}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailReviews: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages (Email)</Label>
                  <p className="text-sm text-gray-500">Receive email for customer messages</p>
                </div>
                <Switch
                  checked={notifications.emailMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailMessages: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages (SMS)</Label>
                  <p className="text-sm text-gray-500">Receive SMS for urgent messages</p>
                </div>
                <Switch
                  checked={notifications.smsMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsMessages: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
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
              Save Settings
            </>
          )}
        </Button>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-semibold">Deactivate Listing</h4>
              <p className="text-sm text-gray-600">
                Temporarily hide your business from search results
              </p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 touch-target" onClick={handleDeactivate}>
              Deactivate
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-semibold">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 touch-target" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
