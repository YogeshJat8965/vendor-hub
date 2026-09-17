'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { CheckoutDialog } from '@/components/billing/CheckoutDialog';
import { toast } from 'sonner';

interface Plan {
  code: string;
  name: string;
  tagline?: string;
  description?: string;
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
}

/** Every row of the comparison table, in display order — built once and
 * reused for both the limit rows and the feature rows below. */
const LIMIT_ROWS: { key: keyof Plan; label: string }[] = [
  { key: 'maxCatalogues', label: 'Catalogues' },
  { key: 'maxItemsPerCatalogue', label: 'Items per catalogue' },
  { key: 'maxImagesPerItem', label: 'Images per item' },
  { key: 'maxCoverImages', label: 'Catalogue cover image' },
  { key: 'maxDescriptionChars', label: 'Description length (characters)' },
];

const FEATURE_ROWS: { key: keyof Plan; label: string }[] = [
  { key: 'allowsGetQuote', label: 'Get Quote' },
  { key: 'allowsPriceRange', label: 'Detailed price range' },
  { key: 'allowsMaterialsDetails', label: 'Materials details' },
  { key: 'allowsProjectTimeline', label: 'Project timeline' },
  { key: 'allowsBeforeAfterImages', label: 'Before / After images' },
  { key: 'allowsVideo', label: 'Video' },
  { key: 'allowsPdfBrochure', label: 'PDF brochure' },
  { key: 'featuredBadge', label: 'Featured badge' },
  { key: 'priorityVisibility', label: 'Priority listing placement' },
  { key: 'allowsExtraCta', label: 'Call / WhatsApp / custom CTA' },
];

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function limitDisplay(value: number) {
  if (value === -1) {
    return (
      <span className="inline-flex items-center gap-1">
        <InfinityIcon className="w-4 h-4" /> Unlimited
      </span>
    );
  }
  return value;
}

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [currentPlanCode, setCurrentPlanCode] = useState<string | null>(null);

  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/plans');
      const data: Plan[] = res.data || [];
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    // Only a vendor can hold a subscription — a customer or admin browsing
    // this page has no "current plan" to highlight.
    if (isAuthenticated && user?.role === 'vendor') {
      apiClient.get('/vendor/plan')
        .then((res) => setCurrentPlanCode(res.data?.plan?.code ?? null))
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  // A plan only offers yearly billing if it actually has a yearly price —
  // if none of them do, the toggle itself would be pointless to show.
  const anyYearlyAvailable = plans.some((p) => p.yearlyPricePaise);

  const handleBuy = (plan: Plan) => {
    if (!isAuthenticated) {
      router.push(`/signup?type=vendor&redirect=/pricing`);
      return;
    }
    if (user?.role !== 'vendor') {
      toast.error('Only vendor accounts can subscribe to a plan');
      return;
    }
    if (plan.monthlyPricePaise === 0) {
      // Reached only when already signed in as a vendor (the !isAuthenticated
      // branch above returns first for a logged-out visitor). There is
      // nothing to check out for a free plan — a vendor on a paid tier moves
      // to it by letting their current subscription lapse (Billing → turn off
      // auto-renew), not by "buying" it. Opening checkout here would just
      // fail at the order step.
      toast.info(`${plan.name} is the default tier — turn off auto-renew in Billing to move to it at the end of your current period.`);
      return;
    }
    if (billingPeriod === 'YEARLY' && !plan.yearlyPricePaise) {
      toast.error(`${plan.name} does not offer yearly billing`);
      return;
    }
    setCheckoutPlan(plan);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#2C2621]">
            Plans built for every stage of your business
          </h1>
          <p className="mt-4 font-body text-lg text-[#6B5E54]">
            Start for free, upgrade when you're ready for more customers.
          </p>
        </div>

        {anyYearlyAvailable && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center rounded-full border border-[#CDC0B0] bg-white p-1">
              {(['MONTHLY', 'YEARLY'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setBillingPeriod(period)}
                  className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-all ${
                    billingPeriod === period
                      ? 'bg-[#2C2621] text-white shadow-warm-sm'
                      : 'text-[#6B5E54] hover:text-[#2C2621]'
                  }`}
                >
                  {period === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#C4975A]" />
          </div>
        ) : (
          <>
            {/* Plan cards */}
            <div className={`grid grid-cols-1 gap-6 max-w-5xl mx-auto ${
              plans.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {plans.map((plan, index) => {
                const price = billingPeriod === 'YEARLY' && plan.yearlyPricePaise
                  ? plan.yearlyPricePaise
                  : plan.monthlyPricePaise;
                const isCurrent = currentPlanCode === plan.code;

                return (
                  <motion.div
                    key={plan.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative rounded-3xl border bg-white p-8 flex flex-col ${
                      plan.highlighted
                        ? 'border-[#C4975A] shadow-[0_8px_32px_rgba(196,151,90,0.18)] sm:scale-105'
                        : 'border-[#CDC0B0]/60 shadow-warm-sm'
                    }`}
                  >
                    {plan.highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4975A] text-white border-none px-3 py-1">
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Most popular
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-xl font-bold text-[#2C2621]">{plan.name}</h3>
                      {isCurrent && <Badge variant="success">Current plan</Badge>}
                    </div>
                    {plan.tagline && <p className="font-body text-sm text-[#6B5E54] mb-4">{plan.tagline}</p>}

                    <div className="mb-6">
                      <span className="font-heading text-4xl font-bold text-[#2C2621]">₹{rupees(price)}</span>
                      {price > 0 && (
                        <span className="font-body text-sm text-[#9C8E82]">
                          /{billingPeriod === 'YEARLY' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleBuy(plan)}
                      disabled={isCurrent || (billingPeriod === 'YEARLY' && !plan.yearlyPricePaise)}
                      className={`mb-6 w-full h-12 rounded-xl font-body ${
                        plan.highlighted
                          ? 'bg-[#C4975A] hover:bg-[#B38549] text-white'
                          : 'bg-[#2C2621] hover:bg-[#2C2621]/90 text-white'
                      }`}
                    >
                      {isCurrent ? 'Your current plan' : price === 0 ? 'Get started free' : 'Choose ' + plan.name}
                    </Button>

                    <ul className="space-y-2.5 flex-1">
                      {LIMIT_ROWS.map(({ key, label }) => (
                        <li key={String(key)} className="flex items-start gap-2 font-body text-sm text-[#2C2621]">
                          <Check className="w-4 h-4 text-[#5B8C5A] mt-0.5 shrink-0" />
                          <span>
                            {limitDisplay(plan[key] as number)} {label.toLowerCase()}
                          </span>
                        </li>
                      ))}
                      {FEATURE_ROWS.filter((row) => plan[row.key]).map(({ key, label }) => (
                        <li key={String(key)} className="flex items-start gap-2 font-body text-sm text-[#2C2621]">
                          <Check className="w-4 h-4 text-[#5B8C5A] mt-0.5 shrink-0" />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Full comparison table */}
            <div className="max-w-5xl mx-auto mt-20">
              <h2 className="font-heading text-2xl font-bold text-[#2C2621] text-center mb-8">
                Compare every feature
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-[#CDC0B0]/50 bg-white">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#CDC0B0]/50 bg-[#FDFBF7]">
                      <th className="px-5 py-4 text-left font-body text-sm font-semibold text-[#6B5E54]">Feature</th>
                      {plans.map((plan) => (
                        <th key={plan.code} className="px-5 py-4 text-left">
                          <span className="font-heading font-bold text-[#2C2621]">{plan.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDC0B0]/30">
                    {LIMIT_ROWS.map(({ key, label }) => (
                      <tr key={String(key)}>
                        <td className="px-5 py-3 font-body text-sm text-[#2C2621]">{label}</td>
                        {plans.map((plan) => (
                          <td key={plan.code} className="px-5 py-3 font-body text-sm text-[#6B5E54] tabular-nums">
                            {limitDisplay(plan[key] as number)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {FEATURE_ROWS.map(({ key, label }) => (
                      <tr key={String(key)}>
                        <td className="px-5 py-3 font-body text-sm text-[#2C2621]">{label}</td>
                        {plans.map((plan) => (
                          <td key={plan.code} className="px-5 py-3">
                            {plan[key] ? (
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
              <p className="text-center font-body text-sm text-[#9C8E82] mt-6">
                Already a vendor?{' '}
                <Link href="/dashboard/vendor/billing" className="text-[#C4975A] underline">
                  Manage your subscription
                </Link>
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />

      {checkoutPlan && (
        <CheckoutDialog
          plan={checkoutPlan}
          billingPeriod={billingPeriod}
          open={Boolean(checkoutPlan)}
          onOpenChange={(open) => !open && setCheckoutPlan(null)}
          onSuccess={() => {
            setCheckoutPlan(null);
            fetchPlans();
            apiClient.get('/vendor/plan').then((res) => setCurrentPlanCode(res.data?.plan?.code ?? null)).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
