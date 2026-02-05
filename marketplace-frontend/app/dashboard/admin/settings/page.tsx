'use client';

import { useState } from 'react';
import { Save, Mail, Bell, Shield, DollarSign, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const settingsSchema = z.object({
  siteName: z.string().min(2, 'Site name is required'),
  supportEmail: z.string().email('Valid email required'),
  adminEmail: z.string().email('Valid email required'),
  commissionRate: z.string().min(1, 'Commission rate is required'),
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const mockSettings = {
  siteName: 'VendorHub Marketplace',
  supportEmail: 'support@vendorhub.com',
  adminEmail: 'admin@vendorhub.com',
  commissionRate: '15',
  termsOfService: 'Terms of service content...',
  privacyPolicy: 'Privacy policy content...',
};

export default function AdminSettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNewVendor: true,
    emailNewUser: true,
    emailFlaggedReview: true,
    emailPayment: true,
    smsUrgent: false,
  });
  const [features, setFeatures] = useState({
    vendorRegistration: true,
    premiumSubscriptions: true,
    reviewSystem: true,
    quoteRequests: true,
    autoApproval: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mockSettings,
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsUpdating(true);
    try {
      // TODO: Call API to update platform settings
      console.log('Update settings:', { ...data, notifications, features });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-gray-600">Configure platform-wide settings and preferences</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="siteName" className="mb-2">Platform Name *</Label>
              <Input
                id="siteName"
                className={`h-12 touch-target ${form.formState.errors.siteName ? 'border-red-500' : ''}`}
                {...form.register('siteName')}
              />
              {form.formState.errors.siteName && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.siteName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="supportEmail" className="mb-2">Support Email *</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  className={`h-12 touch-target ${form.formState.errors.supportEmail ? 'border-red-500' : ''}`}
                  {...form.register('supportEmail')}
                />
                {form.formState.errors.supportEmail && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.supportEmail.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="adminEmail" className="mb-2">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  className={`h-12 touch-target ${form.formState.errors.adminEmail ? 'border-red-500' : ''}`}
                  {...form.register('adminEmail')}
                />
                {form.formState.errors.adminEmail && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.adminEmail.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Commission Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="commissionRate" className="mb-2">Platform Commission Rate (%) *</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                className={`h-12 touch-target ${form.formState.errors.commissionRate ? 'border-red-500' : ''}`}
                {...form.register('commissionRate')}
              />
              {form.formState.errors.commissionRate && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.commissionRate.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Percentage charged on completed transactions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Feature Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vendor Registration</Label>
                  <p className="text-sm text-gray-500">Allow new vendors to register</p>
                </div>
                <Switch
                  checked={features.vendorRegistration}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, vendorRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Premium Subscriptions</Label>
                  <p className="text-sm text-gray-500">Enable premium vendor subscriptions</p>
                </div>
                <Switch
                  checked={features.premiumSubscriptions}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, premiumSubscriptions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Review System</Label>
                  <p className="text-sm text-gray-500">Allow customers to leave reviews</p>
                </div>
                <Switch
                  checked={features.reviewSystem}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, reviewSystem: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quote Requests</Label>
                  <p className="text-sm text-gray-500">Enable quote request functionality</p>
                </div>
                <Switch
                  checked={features.quoteRequests}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, quoteRequests: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Approve Vendors</Label>
                  <p className="text-sm text-gray-500">Automatically approve new vendor registrations</p>
                </div>
                <Switch
                  checked={features.autoApproval}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, autoApproval: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Admin Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Vendor Registration (Email)</Label>
                  <p className="text-sm text-gray-500">Get notified when vendors register</p>
                </div>
                <Switch
                  checked={notifications.emailNewVendor}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNewVendor: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New User Registration (Email)</Label>
                  <p className="text-sm text-gray-500">Get notified when users sign up</p>
                </div>
                <Switch
                  checked={notifications.emailNewUser}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNewUser: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Flagged Reviews (Email)</Label>
                  <p className="text-sm text-gray-500">Get notified about flagged content</p>
                </div>
                <Switch
                  checked={notifications.emailFlaggedReview}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailFlaggedReview: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications (Email)</Label>
                  <p className="text-sm text-gray-500">Get notified about payments</p>
                </div>
                <Switch
                  checked={notifications.emailPayment}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailPayment: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Urgent Alerts (SMS)</Label>
                  <p className="text-sm text-gray-500">Receive SMS for critical issues</p>
                </div>
                <Switch
                  checked={notifications.smsUrgent}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsUrgent: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Legal Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="termsOfService" className="mb-2">Terms of Service</Label>
              <Textarea
                id="termsOfService"
                className="min-h-32 touch-target"
                placeholder="Enter terms of service content..."
                {...form.register('termsOfService')}
              />
            </div>
            <div>
              <Label htmlFor="privacyPolicy" className="mb-2">Privacy Policy</Label>
              <Textarea
                id="privacyPolicy"
                className="min-h-32 touch-target"
                placeholder="Enter privacy policy content..."
                {...form.register('privacyPolicy')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 touch-target"
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
    </div>
  );
}
