'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Sparkles,
  Calendar,
  CreditCard,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  Lock,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { exportToCsv } from '@/lib/csv';
import { CheckoutDialog } from '@/components/billing/CheckoutDialog';
import { toast } from 'sonner';

interface Entitlements {
  plan: { code: string; name: string; tagline?: string; monthlyPricePaise: number; yearlyPricePaise?: number | null };
  limits: { maxCatalogues: number; maxItemsPerCatalogue: number; maxImagesPerItem: number; maxCoverImages: number; maxDescriptionChars: number };
  features: Record<string, boolean>;
  usage: { cataloguesUsed: number; cataloguesRemaining: number | null; cataloguesVisible: number; cataloguesLocked: number; overCatalogueLimit: boolean };
}

interface Subscription {
  id: string;
  planCode: string;
  status: string;
  amountPaidPaise: number;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface Plan {
  code: string;
  name: string;
  monthlyPricePaise: number;
  yearlyPricePaise?: number | null;
  purchasable: boolean;
}

interface Transaction {
  id: string;
  planCode: string;
  amountPaise: number;
  currency: string;
  status: string;
  failureReason?: string;
  couponCode?: string | null;
  couponDiscountPaise?: number;
  createdAt: string;
}

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'text-[#5B8C5A] border-[#5B8C5A]/30',
  FAILED: 'text-[#B85C5C] border-[#B85C5C]/30',
  PENDING: 'text-[#C4975A] border-[#C4975A]/30',
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  SUCCESS: CheckCircle2,
  FAILED: XCircle,
  PENDING: Clock,
};

export default function VendorBillingPage() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [entRes, subRes, plansRes, historyRes] = await Promise.all([
        apiClient.get('/vendor/plan'),
        apiClient.get('/vendor/payments/subscription'),
        apiClient.get('/plans'),
        apiClient.get('/vendor/payments/history'),
      ]);
      setEntitlements(entRes.data);
      setSubscription(subRes.data || null);
      setPlans(plansRes.data || []);
      setHistory(historyRes.data || []);
    } catch (error) {
      console.error('Failed to load billing:', error);
      toast.error('Failed to load billing details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) fetchAll();
  }, [user, fetchAll]);

  const handleExport = () => {
    const ok = exportToCsv('vendorhub-billing-history', history, [
      { header: 'Date', value: (t) => formatDate(t.createdAt) },
      { header: 'Plan', value: (t) => t.planCode },
      { header: 'Amount', value: (t) => `₹${rupees(t.amountPaise)}` },
      { header: 'Coupon', value: (t) => t.couponCode ?? '' },
      { header: 'Status', value: (t) => t.status },
      { header: 'Failure reason', value: (t) => t.failureReason ?? '' },
    ]);
    if (ok) toast.success('Billing history downloaded');
    else toast.error('No transactions to export yet');
  };

  if (isLoading || !entitlements) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  // There is no downgrade and no auto-renewal: a plan is fixed-term. Only a
  // pricier plan can be bought while one is active (an immediate, prorated
  // upgrade) — a cheaper plan is shown but disabled with an explanation, and
  // becomes buyable again only once the current plan naturally expires.
  const otherPlans = plans.filter((p) => p.code !== entitlements.plan.code && p.purchasable && p.monthlyPricePaise > 0);
  const isPaid = entitlements.plan.monthlyPricePaise > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2C2621]">Billing</h1>
        <p className="mt-1.5 font-body text-sm text-[#6B5E54]">Your plan, usage and payment history</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-[#2C2621]">{entitlements.plan.name}</h2>
                {entitlements.plan.code !== 'FREE' && <Badge variant="premium"><Sparkles className="w-3 h-3" />Paid plan</Badge>}
              </div>
              {entitlements.plan.tagline && <p className="font-body text-sm text-[#6B5E54] mt-1">{entitlements.plan.tagline}</p>}
            </div>
            <Link href="/pricing">
              <Button variant="outline" className="rounded-xl">
                <ArrowUpRight className="w-4 h-4" />
                Upgrade plan
              </Button>
            </Link>
          </div>

          {subscription && subscription.status === 'ACTIVE' && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#CDC0B0]/40">
              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#9C8E82] mt-0.5" />
                <div>
                  <p className="text-xs text-[#9C8E82]">Paid</p>
                  <p className="text-sm text-[#2C2621] font-medium">
                    ₹{rupees(subscription.amountPaidPaise)} for this {subscription.billingPeriod === 'YEARLY' ? 'year' : 'month'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#9C8E82] mt-0.5" />
                <div>
                  <p className="text-xs text-[#9C8E82]">Expires on</p>
                  <p className="text-sm text-[#2C2621] font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              </div>
              <p className="sm:col-span-2 text-xs text-[#9C8E82] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                There's no auto-renewal — buy again before this date to keep your plan, or you'll move to Free automatically.
              </p>
            </div>
          )}

          {!isPaid && (
            <p className="mt-5 pt-5 border-t border-[#CDC0B0]/40 font-body text-sm text-[#6B5E54]">
              You're on the free plan. <Link href="/pricing" className="text-[#C4975A] underline">Upgrade</Link> for more catalogues and premium features.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageRow
            label="Catalogues"
            used={entitlements.usage.cataloguesUsed}
            limit={entitlements.limits.maxCatalogues}
          />
          {entitlements.usage.cataloguesLocked > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#C4975A]/40 bg-[#C4975A]/8 p-3">
              <AlertTriangle className="w-4 h-4 text-[#C4975A] mt-0.5 shrink-0" />
              <p className="font-body text-sm text-[#6B5E54]">
                {entitlements.usage.cataloguesLocked} catalogue{entitlements.usage.cataloguesLocked === 1 ? ' is' : ' are'} hidden
                from customers because they're over your current plan's limit. Upgrade to make them visible again.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <LimitFact label="Items per catalogue" value={entitlements.limits.maxItemsPerCatalogue} />
            <LimitFact label="Images per item" value={entitlements.limits.maxImagesPerItem} />
            <LimitFact label="Cover images" value={entitlements.limits.maxCoverImages} />
            <LimitFact label="Description length" value={entitlements.limits.maxDescriptionChars} suffix=" chars" />
          </div>
        </CardContent>
      </Card>

      {/* Other plans */}
      {otherPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherPlans.map((plan) => {
                const isDowngrade = plan.monthlyPricePaise < entitlements.plan.monthlyPricePaise;
                return (
                  <div key={plan.code} className="flex items-center justify-between rounded-xl border border-[#CDC0B0]/50 p-4">
                    <div>
                      <p className="font-heading font-semibold text-[#2C2621]">{plan.name}</p>
                      <p className="font-body text-sm text-[#9C8E82]">₹{rupees(plan.monthlyPricePaise)}/mo</p>
                      {isDowngrade && (
                        <p className="font-body text-xs text-[#9C8E82] mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Available once {entitlements.plan.name} expires
                        </p>
                      )}
                    </div>
                    {isDowngrade ? (
                      <Button size="sm" variant="outline" disabled className="rounded-xl">
                        Downgrade
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setCheckoutPlan(plan)} className="rounded-xl bg-[#2C2621] hover:bg-[#2C2621]/90 text-white">
                        Upgrade
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Payment history</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="font-body text-sm text-[#9C8E82] text-center py-8">No payments yet.</p>
          ) : (
            <div className="divide-y divide-[#CDC0B0]/40">
              {history.map((t) => {
                const Icon = STATUS_ICONS[t.status] ?? Clock;
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${STATUS_STYLES[t.status]?.split(' ')[0] ?? 'text-[#9C8E82]'}`} />
                      <div className="min-w-0">
                        <p className="font-body text-sm text-[#2C2621]">{t.planCode} plan</p>
                        <p className="font-body text-xs text-[#9C8E82]">
                          {formatDate(t.createdAt)}
                          {t.couponCode && ` · Coupon ${t.couponCode} (−₹${rupees(t.couponDiscountPaise ?? 0)})`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-body text-sm font-medium text-[#2C2621] tabular-nums">₹{rupees(t.amountPaise)}</p>
                      <Badge variant="outline" className={STATUS_STYLES[t.status] ?? ''}>{t.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {checkoutPlan && (
        <CheckoutDialog
          plan={checkoutPlan}
          billingPeriod="MONTHLY"
          open={Boolean(checkoutPlan)}
          onOpenChange={(open) => !open && setCheckoutPlan(null)}
          onSuccess={() => { setCheckoutPlan(null); fetchAll(); }}
        />
      )}
    </div>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, (used / Math.max(1, limit)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="font-body text-sm text-[#2C2621]">{label}</p>
        <p className="font-body text-sm text-[#6B5E54] tabular-nums">
          {used} / {unlimited ? <InfinityIcon className="w-3.5 h-3.5 inline" /> : limit}
        </p>
      </div>
      {!unlimited && (
        <div className="h-2 rounded-full bg-[#E7DBCD] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-[#B85C5C]' : 'bg-[#C4975A]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function LimitFact({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#FDFBF7] border border-[#CDC0B0]/40 px-3 py-2">
      <span className="font-body text-xs text-[#6B5E54]">{label}</span>
      <span className="font-body text-xs font-medium text-[#2C2621] tabular-nums">
        {value === -1 ? <InfinityIcon className="w-3.5 h-3.5" /> : `${value}${suffix}`}
      </span>
    </div>
  );
}
