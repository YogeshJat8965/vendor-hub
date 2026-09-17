'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Shield,
  Globe,
  Loader2,
  Store,
  Star,
  FileText,
  Timer,
  Lock,
  Info,
  RotateCcw,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { AdminPageHeader, AdminSectionCard } from '@/components/admin';

interface PlatformSettings {
  siteName: string;
  supportEmail: string | null;
  adminEmail: string | null;
  autoApproveVendors: boolean;
  vendorRegistrationEnabled: boolean;
  reviewsEnabled: boolean;
  quoteRequestsEnabled: boolean;
  autoCompleteDays: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

const DEFAULTS: PlatformSettings = {
  siteName: 'VendorHub',
  supportEmail: '',
  adminEmail: '',
  autoApproveVendors: true,
  vendorRegistrationEnabled: true,
  reviewsEnabled: true,
  quoteRequestsEnabled: true,
  autoCompleteDays: 7,
};

/** A labelled switch row that states what flipping it actually does to the product. */
function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  effect,
}: {
  icon: typeof Store;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Consequence of leaving this off — shown only while it is off. */
  effect?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#E7DBCD] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#6B5E54]" />
        </div>
        <div className="min-w-0">
          <Label className="font-body font-medium text-[#2C2621]">{label}</Label>
          <p className="font-body text-sm text-[#6B5E54] mt-0.5">{description}</p>
          {effect && !checked && (
            <p className="font-body text-xs text-[#B85C5C] mt-1.5">{effect}</p>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0 mt-1" />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [saved, setSaved] = useState<PlatformSettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/settings');
      const loaded: PlatformSettings = {
        ...DEFAULTS,
        ...res.data,
        supportEmail: res.data.supportEmail ?? '',
        adminEmail: res.data.adminEmail ?? '',
      };
      setSettings(loaded);
      setSaved(loaded);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user, fetchSettings]);

  // Compared against what was actually persisted, so the Save button can't
  // claim unsaved work that doesn't exist.
  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    if (!settings.siteName.trim()) {
      toast.error('Platform name is required');
      return;
    }
    if (settings.supportEmail && !/^\S+@\S+\.\S+$/.test(settings.supportEmail)) {
      toast.error('Support email is not a valid address');
      return;
    }
    if (settings.adminEmail && !/^\S+@\S+\.\S+$/.test(settings.adminEmail)) {
      toast.error('Admin email is not a valid address');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.put('/admin/settings', settings);
      const persisted: PlatformSettings = {
        ...DEFAULTS,
        ...res.data,
        supportEmail: res.data.supportEmail ?? '',
        adminEmail: res.data.adminEmail ?? '',
      };
      setSettings(persisted);
      setSaved(persisted);
      toast.success('Settings saved — these take effect immediately');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error?.response?.data?.error || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Settings"
        description="Platform-wide configuration — every switch here changes real behaviour"
        actions={
          <>
            {isDirty && (
              <Button variant="outline" onClick={() => setSettings(saved)} disabled={isSaving}>
                <RotateCcw className="w-4 h-4" />
                Discard
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isDirty ? 'Save changes' : 'Saved'}
            </Button>
          </>
        }
      />

      {saved.updatedAt && (
        <p className="font-body text-xs text-[#9C8E82]">
          Last changed {new Date(saved.updatedAt).toLocaleString()}
        </p>
      )}

      {/* General */}
      <AdminSectionCard title="General" icon={Globe}>
        <div className="space-y-5">
          <div>
            <Label htmlFor="siteName" className="mb-2">Platform name *</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="supportEmail" className="mb-2">Support email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail ?? ''}
                onChange={(e) => update('supportEmail', e.target.value)}
                placeholder="support@example.com"
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="adminEmail" className="mb-2">Admin email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail ?? ''}
                onChange={(e) => update('adminEmail', e.target.value)}
                placeholder="admin@example.com"
                className="h-11"
              />
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* Vendor onboarding */}
      <AdminSectionCard title="Vendor Onboarding" icon={Store}>
        <div className="divide-y divide-[#CDC0B0]/40">
          <ToggleRow
            icon={Store}
            label="Vendor registration"
            description="Allow new vendors to sign up for the platform."
            checked={settings.vendorRegistrationEnabled}
            onChange={(v) => update('vendorRegistrationEnabled', v)}
            effect="Vendor signup is currently blocked — new registrations are refused."
          />
          <ToggleRow
            icon={Shield}
            label="Auto-approve vendors"
            description="New vendors go live immediately instead of waiting in the approval queue."
            checked={settings.autoApproveVendors}
            onChange={(v) => update('autoApproveVendors', v)}
            effect="New signups will land in the approval queue and stay hidden until you approve them."
          />
        </div>
        {settings.autoApproveVendors && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-3">
            <Info className="w-4 h-4 text-[#9C8E82] mt-0.5 shrink-0" />
            <p className="font-body text-xs text-[#6B5E54]">
              While auto-approval is on, the Vendors approval queue will always be empty — every signup is
              activated the moment it is created.
            </p>
          </div>
        )}
      </AdminSectionCard>

      {/* Features */}
      <AdminSectionCard title="Features" icon={Shield}>
        <div className="divide-y divide-[#CDC0B0]/40">
          <ToggleRow
            icon={FileText}
            label="Quote requests"
            description="Allow customers to send new quote requests to vendors."
            checked={settings.quoteRequestsEnabled}
            onChange={(v) => update('quoteRequestsEnabled', v)}
            effect="Customers cannot raise new quotes. Existing quotes continue as normal."
          />
          <ToggleRow
            icon={Star}
            label="Reviews"
            description="Allow customers to post reviews after a completed project."
            checked={settings.reviewsEnabled}
            onChange={(v) => update('reviewsEnabled', v)}
            effect="New reviews are refused. Existing reviews stay visible and still count toward ratings."
          />
        </div>
      </AdminSectionCard>

      {/* Delivery */}
      <AdminSectionCard title="Delivery" icon={Timer}>
        <div>
          <Label htmlFor="autoCompleteDays" className="mb-2">Auto-complete window (days)</Label>
          <Input
            id="autoCompleteDays"
            type="number"
            min={1}
            max={90}
            value={settings.autoCompleteDays}
            onChange={(e) => update('autoCompleteDays', Number(e.target.value))}
            className="h-11 max-w-[10rem]"
          />
          <p className="font-body text-xs text-[#6B5E54] mt-2">
            How long a delivered job waits for the customer to confirm before it completes automatically.
            A disputed delivery is never auto-completed. Applies from the next hourly run — the countdowns
            on the Deliveries page update to match.
          </p>
        </div>
      </AdminSectionCard>

      {/* Payments — subscriptions are real now; commission still isn't a fit */}
      <AdminSectionCard title="Payments" icon={IndianRupee}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5B8C5A]/12 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 text-[#5B8C5A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="font-body font-medium text-[#2C2621]">Vendor subscriptions</Label>
                <Badge variant="success">Live</Badge>
              </div>
              <p className="font-body text-sm text-[#6B5E54] mt-0.5">
                Plans, prices and every limit are configured on the{' '}
                <Link href="/dashboard/admin/plans" className="text-[#C4975A] underline">Plans</Link> page. Real
                revenue, subscribers and refunds are on{' '}
                <Link href="/dashboard/admin/subscriptions" className="text-[#C4975A] underline">Subscriptions</Link>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60 pt-4 border-t border-[#CDC0B0]/40">
            <div className="w-9 h-9 rounded-xl bg-[#E7DBCD] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#9C8E82]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="font-body font-medium text-[#2C2621]">Commission rate</Label>
                <Badge variant="secondary">Not applicable</Badge>
              </div>
              <p className="font-body text-sm text-[#6B5E54] mt-0.5">
                VendorHub charges vendors a flat subscription fee, not a percentage of the jobs they complete —
                there is no transaction here for a commission rate to apply to. This isn't a missing feature so
                much as a setting that doesn't fit this business model.
              </p>
            </div>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}
