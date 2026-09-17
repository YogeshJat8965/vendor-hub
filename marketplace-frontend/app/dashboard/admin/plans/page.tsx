'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  Save,
  RotateCcw,
  Layers,
  IndianRupee,
  Sparkles,
  Users,
  Eye,
  AlertTriangle,
  Check,
  X,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { AdminPageHeader, AdminSectionCard, AdminStatCard } from '@/components/admin';

/** -1 is the backend's sentinel for "no limit" on any numeric cap. */
const UNLIMITED = -1;

interface Plan {
  id: string;
  code: string;
  name: string;
  tagline?: string;
  description?: string;
  displayOrder: number;
  highlighted: boolean;
  badgeColor?: string;
  monthlyPricePaise: number;
  yearlyPricePaise?: number | null;
  currency: string;
  purchasable: boolean;
  maxCatalogues: number;
  maxItemsPerCatalogue: number;
  maxImagesPerItem: number;
  maxCoverImages: number;
  maxDescriptionChars: number;
  allowsGetQuote: boolean;
  allowsPriceRange: boolean;
  allowsMaterialsDetails: boolean;
  allowsProjectTimeline: boolean;
  allowsBeforeAfterImages: boolean;
  allowsVideo: boolean;
  allowsPdfBrochure: boolean;
  featuredBadge: boolean;
  priorityVisibility: boolean;
  allowsExtraCta: boolean;
  isDefault: boolean;
  updatedAt?: string;
}

interface PlanRow {
  plan: Plan;
  subscriberCount: number;
}

const LIMIT_FIELDS = [
  { key: 'maxCatalogues', label: 'Catalogues', hint: 'How many catalogues this tier may publish' },
  { key: 'maxItemsPerCatalogue', label: 'Items per catalogue', hint: 'Services or products inside one catalogue' },
  { key: 'maxImagesPerItem', label: 'Images per item', hint: 'Photos on a single catalogue item' },
  { key: 'maxCoverImages', label: 'Cover images', hint: 'Cover photos on the catalogue itself' },
  { key: 'maxDescriptionChars', label: 'Description length', hint: 'Maximum characters in an item description' },
] as const;

const FEATURE_FIELDS = [
  { key: 'allowsGetQuote', label: 'Get Quote', hint: 'Customers can request a quote from this vendor' },
  { key: 'allowsPriceRange', label: 'Price range', hint: 'Show a detailed price range, not just a starting price' },
  { key: 'allowsMaterialsDetails', label: 'Materials details', hint: 'Describe the materials used on a service' },
  { key: 'allowsProjectTimeline', label: 'Project timeline', hint: 'Publish an expected timeline for a service' },
  { key: 'allowsBeforeAfterImages', label: 'Before / After images', hint: 'Attach before-and-after photo pairs' },
  { key: 'allowsVideo', label: 'Video', hint: 'Attach a video to a catalogue item' },
  { key: 'allowsPdfBrochure', label: 'PDF brochure', hint: 'Attach a downloadable brochure' },
  { key: 'featuredBadge', label: 'Featured badge', hint: 'Show a Featured badge on listings and the storefront' },
  { key: 'priorityVisibility', label: 'Priority visibility', hint: 'Rank above lower tiers in the default listing order' },
  { key: 'allowsExtraCta', label: 'Call / WhatsApp / custom CTA', hint: 'Extra contact buttons beyond Get Quote' },
] as const;

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/** A numeric limit input with an "Unlimited" toggle, since -1 is not typeable. */
function LimitInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const isUnlimited = value === UNLIMITED;

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <Label className="font-body font-medium text-[#2C2621]">{label}</Label>
        <p className="font-body text-xs text-[#6B5E54] mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Input
          type="number"
          min={0}
          value={isUnlimited ? '' : value}
          disabled={isUnlimited}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-10 w-24 tabular-nums"
          placeholder={isUnlimited ? '∞' : undefined}
          aria-label={label}
        />
        <Button
          type="button"
          variant={isUnlimited ? 'default' : 'outline'}
          size="sm"
          className="h-10"
          onClick={() => onChange(isUnlimited ? 1 : UNLIMITED)}
          aria-pressed={isUnlimited}
        >
          <InfinityIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function FeatureToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <Label className="font-body font-medium text-[#2C2621]">{label}</Label>
        <p className="font-body text-xs text-[#6B5E54] mt-0.5">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0 mt-0.5" />
    </div>
  );
}

export default function AdminPlansPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Plan>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/plans');
      const data: PlanRow[] = res.data || [];
      setRows(data);
      setDrafts(Object.fromEntries(data.map((r) => [r.plan.code, { ...r.plan }])));
      setActiveCode((current) => current ?? data[0]?.plan.code ?? null);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user, fetchPlans]);

  const saved = useMemo(
    () => Object.fromEntries(rows.map((r) => [r.plan.code, r.plan])),
    [rows]
  );

  const isDirty = (code: string) =>
    JSON.stringify(drafts[code]) !== JSON.stringify(saved[code]);

  const update = <K extends keyof Plan>(code: string, key: K, value: Plan[K]) =>
    setDrafts((d) => ({ ...d, [code]: { ...d[code], [key]: value } }));

  const savePlan = async (code: string) => {
    const draft = drafts[code];
    if (!draft) return;

    setSavingCode(code);
    try {
      await apiClient.put(`/admin/plans/${code}`, draft);
      await fetchPlans();
      toast.success(`${draft.name} saved — the new values apply immediately`);
    } catch (error: any) {
      console.error('Failed to save plan:', error);
      toast.error(error?.response?.data?.error || 'Failed to save plan');
    } finally {
      setSavingCode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  const active = activeCode ? drafts[activeCode] : null;
  const activeRow = rows.find((r) => r.plan.code === activeCode);
  const totalSubscribers = rows.reduce((sum, r) => sum + r.subscriberCount, 0);
  const paidSubscribers = rows
    .filter((r) => r.plan.monthlyPricePaise > 0)
    .reduce((sum, r) => sum + r.subscriberCount, 0);

  /**
   * Lowering a limit doesn't delete anything, but it does hide a vendor's
   * excess content from the public site — so the admin is told before saving,
   * not after.
   */
  const loweredLimits = active && saved[active.code]
    ? LIMIT_FIELDS.filter(({ key }) => {
        const before = saved[active.code][key] as number;
        const after = active[key] as number;
        if (before === after) return false;
        if (after === UNLIMITED) return false;
        return before === UNLIMITED || after < before;
      })
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Plans"
        description="Prices, limits and features for every subscription tier — changes apply immediately, everywhere"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Plans" value={rows.length} icon={Layers} tone="accent" />
        <AdminStatCard label="Vendors on a plan" value={totalSubscribers} icon={Users} tone="neutral" />
        <AdminStatCard
          label="On a paid plan"
          value={paidSubscribers}
          icon={IndianRupee}
          tone={paidSubscribers ? 'success' : 'neutral'}
        />
        <AdminStatCard
          label="Highest price"
          value={`₹${rupees(Math.max(...rows.map((r) => r.plan.monthlyPricePaise), 0))}`}
          icon={Sparkles}
          tone="warning"
          hint="per month"
        />
      </div>

      {/* Plan selector */}
      <div className="flex flex-wrap gap-2">
        {rows.map(({ plan, subscriberCount }) => {
          const isActive = plan.code === activeCode;
          const dirty = isDirty(plan.code);
          return (
            <button
              key={plan.code}
              type="button"
              onClick={() => setActiveCode(plan.code)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#2C2621] text-white border-[#2C2621] shadow-warm-sm'
                  : 'border-[#CDC0B0] bg-white text-[#6B5E54] hover:bg-[#E7DBCD]/60 hover:text-[#2C2621]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: plan.badgeColor || '#9C8E82' }}
              />
              {plan.name}
              <span className={`text-xs tabular-nums ${isActive ? 'text-white/70' : 'text-[#9C8E82]'}`}>
                ₹{rupees(plan.monthlyPricePaise)}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#E7DBCD] text-[#6B5E54]'
                }`}
              >
                {subscriberCount}
              </span>
              {dirty && <span className="w-1.5 h-1.5 rounded-full bg-[#C4975A]" aria-label="Unsaved changes" />}
            </button>
          );
        })}
      </div>

      {active && activeRow && (
        <>
          {/* Save bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#CDC0B0]/50 bg-white px-5 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg text-[#2C2621]">{active.name}</h2>
              <Badge variant="outline" className="font-mono text-xs">{active.code}</Badge>
              {active.isDefault && <Badge variant="secondary">Default tier</Badge>}
              {!active.purchasable && <Badge variant="warning">Not purchasable</Badge>}
              <span className="font-body text-xs text-[#9C8E82]">
                {activeRow.subscriberCount} vendor{activeRow.subscriberCount === 1 ? '' : 's'} on this plan
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDirty(active.code) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrafts((d) => ({ ...d, [active.code]: { ...saved[active.code] } }))}
                >
                  <RotateCcw className="w-4 h-4" />
                  Discard
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => savePlan(active.code)}
                disabled={!isDirty(active.code) || savingCode === active.code}
              >
                {savingCode === active.code ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isDirty(active.code) ? 'Save changes' : 'Saved'}
              </Button>
            </div>
          </div>

          {loweredLimits.length > 0 && activeRow.subscriberCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#C4975A]/40 bg-[#C4975A]/8 p-4">
              <AlertTriangle className="w-5 h-5 text-[#C4975A] mt-0.5 shrink-0" />
              <div>
                <p className="font-heading font-semibold text-sm text-[#8A6534]">
                  You are lowering {loweredLimits.map((f) => f.label.toLowerCase()).join(', ')}
                </p>
                <p className="font-body text-sm text-[#6B5E54] mt-1">
                  {activeRow.subscriberCount} vendor{activeRow.subscriberCount === 1 ? ' is' : 's are'} on this
                  plan. Anything over the new limit is hidden from the public site — nothing is deleted, and it
                  reappears if you raise the limit again or the vendor upgrades.
                </p>
              </div>
            </div>
          )}

          {active.isDefault && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#CDC0B0]/50 bg-[#FDFBF7] p-4">
              <AlertTriangle className="w-5 h-5 text-[#9C8E82] mt-0.5 shrink-0" />
              <p className="font-body text-sm text-[#6B5E54]">
                This is the default tier. Every vendor without a paid subscription falls back to it, so it must
                stay free and purchasable, and it cannot be deleted.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing */}
            <AdminSectionCard title="Pricing" icon={IndianRupee}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly" className="mb-2">Monthly price (₹)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    min={0}
                    step="0.01"
                    value={active.monthlyPricePaise / 100}
                    disabled={active.isDefault}
                    onChange={(e) => update(active.code, 'monthlyPricePaise', Math.round(Number(e.target.value) * 100))}
                    className="h-11 max-w-[12rem] tabular-nums"
                  />
                  <p className="font-body text-xs text-[#9C8E82] mt-1.5">
                    {active.isDefault
                      ? 'The default tier is always free.'
                      : 'Stored in paise. Vendors already subscribed keep the price they paid until renewal.'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="yearly" className="mb-2">Yearly price (₹) — optional</Label>
                  <Input
                    id="yearly"
                    type="number"
                    min={0}
                    step="0.01"
                    value={active.yearlyPricePaise ? active.yearlyPricePaise / 100 : ''}
                    disabled={active.isDefault}
                    placeholder="Leave blank for monthly only"
                    onChange={(e) =>
                      update(
                        active.code,
                        'yearlyPricePaise',
                        e.target.value === '' ? null : Math.round(Number(e.target.value) * 100)
                      )
                    }
                    className="h-11 max-w-[12rem] tabular-nums"
                  />
                  <p className="font-body text-xs text-[#9C8E82] mt-1.5">
                    When set, a yearly option appears at checkout.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 pt-1">
                  <div>
                    <Label className="font-body font-medium text-[#2C2621]">Purchasable</Label>
                    <p className="font-body text-xs text-[#6B5E54] mt-0.5">
                      Turn off to retire a tier: it disappears from the pricing page but keeps working for
                      everyone already on it.
                    </p>
                  </div>
                  <Switch
                    checked={active.purchasable}
                    disabled={active.isDefault}
                    onCheckedChange={(v) => update(active.code, 'purchasable', v)}
                    className="shrink-0 mt-0.5"
                  />
                </div>
              </div>
            </AdminSectionCard>

            {/* Presentation */}
            <AdminSectionCard title="Presentation" icon={Eye}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="mb-2">Name</Label>
                  <Input
                    id="name"
                    value={active.name}
                    onChange={(e) => update(active.code, 'name', e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline" className="mb-2">Tagline</Label>
                  <Input
                    id="tagline"
                    value={active.tagline ?? ''}
                    onChange={(e) => update(active.code, 'tagline', e.target.value)}
                    placeholder="One line shown under the plan name"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2">Description</Label>
                  <Textarea
                    id="description"
                    value={active.description ?? ''}
                    onChange={(e) => update(active.code, 'description', e.target.value)}
                    className="min-h-20"
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <Label htmlFor="badgeColor" className="mb-2">Badge colour</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="badgeColor"
                        type="color"
                        value={active.badgeColor || '#9C8E82'}
                        onChange={(e) => update(active.code, 'badgeColor', e.target.value)}
                        className="h-11 w-14 rounded-lg border border-[#CDC0B0] cursor-pointer bg-white"
                      />
                      <span className="font-mono text-xs text-[#6B5E54]">{active.badgeColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={active.highlighted}
                      onCheckedChange={(v) => update(active.code, 'highlighted', v)}
                    />
                    <div>
                      <Label className="font-body font-medium text-[#2C2621]">Most popular</Label>
                      <p className="font-body text-xs text-[#6B5E54]">Ribbon on the pricing page</p>
                    </div>
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </div>

          {/* Limits */}
          <AdminSectionCard title="Limits" icon={Layers}>
            <div className="divide-y divide-[#CDC0B0]/40">
              {LIMIT_FIELDS.map(({ key, label, hint }) => (
                <LimitInput
                  key={key}
                  label={label}
                  hint={hint}
                  value={active[key] as number}
                  onChange={(v) => update(active.code, key, v as never)}
                />
              ))}
            </div>
            <p className="font-body text-xs text-[#9C8E82] mt-3">
              Use the ∞ button for no limit. 0 means the tier cannot use that feature at all.
            </p>
          </AdminSectionCard>

          {/* Features */}
          <AdminSectionCard title="Features" icon={Sparkles}>
            <div className="divide-y divide-[#CDC0B0]/40">
              {FEATURE_FIELDS.map(({ key, label, hint }) => (
                <FeatureToggle
                  key={key}
                  label={label}
                  hint={hint}
                  checked={active[key] as boolean}
                  onChange={(v) => update(active.code, key, v as never)}
                />
              ))}
            </div>
          </AdminSectionCard>

          {/* Live comparison preview */}
          <AdminSectionCard title="Customer preview" icon={Eye}>
            <p className="font-body text-sm text-[#6B5E54] mb-4">
              Exactly how these plans appear on the public pricing page, using your unsaved values.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-[#CDC0B0]/50">
                    <th className="px-3 py-2.5 text-left font-body text-xs font-semibold uppercase tracking-wide text-[#6B5E54]">
                      Feature
                    </th>
                    {rows.map(({ plan }) => {
                      const d = drafts[plan.code];
                      return (
                        <th key={plan.code} className="px-3 py-2.5 text-left">
                          <span className="font-heading font-bold text-sm text-[#2C2621]">{d.name}</span>
                          <span className="block font-body text-xs text-[#9C8E82] tabular-nums">
                            ₹{rupees(d.monthlyPricePaise)}/mo
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDC0B0]/30">
                  {LIMIT_FIELDS.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="px-3 py-2 font-body text-sm text-[#2C2621]">{label}</td>
                      {rows.map(({ plan }) => {
                        const v = drafts[plan.code][key] as number;
                        return (
                          <td key={plan.code} className="px-3 py-2 font-body text-sm text-[#6B5E54] tabular-nums">
                            {v === UNLIMITED ? 'Unlimited' : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {FEATURE_FIELDS.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="px-3 py-2 font-body text-sm text-[#2C2621]">{label}</td>
                      {rows.map(({ plan }) => (
                        <td key={plan.code} className="px-3 py-2">
                          {drafts[plan.code][key] ? (
                            <Check className="w-4 h-4 text-[#5B8C5A]" aria-label="Included" />
                          ) : (
                            <X className="w-4 h-4 text-[#CDC0B0]" aria-label="Not included" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminSectionCard>
        </>
      )}
    </div>
  );
}
