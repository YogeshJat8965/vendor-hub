'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, MessageSquare, Star, Calendar, Loader2, Lock, Heart, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Entitlements {
  profileViewsCount: boolean;
  quoteTrend: boolean;
  viewsTrend: boolean;
  ratingTrend: boolean;
  conversionInsights: boolean;
  favoritesInsights: boolean;
}

interface AnalyticsData {
  plan: { code: string; name: string };
  entitlements: Entitlements;
  totalQuotes: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number | null;
  quoteTrend: { date: string; count: number }[] | null;
  viewsTrend: { date: string; count: number }[] | null;
  ratingTrend: { date: string; rating: number }[] | null;
  conversionRatePct: number | null;
  favoritesCount: number | null;
  recentFavorites: { customerName: string; createdAt: string }[] | null;
}

/** Wraps locked content in a blurred preview with an upgrade prompt, rather than hiding it outright. */
function LockedOverlay({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative">
      <div className="blur-[3px] opacity-50 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-[#2C2621] flex items-center justify-center">
          <Lock className="w-4 h-4 text-[#EEDDCC]" />
        </div>
        <p className="font-body text-sm font-medium text-[#2C2621]">{label}</p>
        <Link href="/pricing" className="font-body text-xs font-bold text-[#C4975A] underline underline-offset-2">
          Upgrade to unlock
        </Link>
      </div>
    </div>
  );
}

function BarChart({ data, unit, color }: { data: { date: string; count: number }[]; unit: string; color: string }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="h-64 flex items-end justify-between gap-1">
      {data.map((d, index) => {
        const height = (d.count / maxCount) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center min-w-0">
            <div
              className="w-full rounded-t-sm hover:opacity-80 transition-opacity relative group"
              style={{ height: `${height}%`, minHeight: d.count > 0 ? '20px' : '4px', backgroundColor: color }}
            >
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2C2621] text-[#FDFBF7] font-body text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg left-1/2 -translate-x-1/2">
                {d.count} {unit}
              </div>
            </div>
            <span className="text-[10px] font-body font-medium text-[#9C8E82] mt-2 hidden sm:block">
              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const PLACEHOLDER_TREND = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(Date.now() - (9 - i) * 86400000).toISOString(),
  count: Math.round(20 + Math.sin(i) * 15 + i * 2),
}));

/**
 * The full, working Analytics page — kept out of Next's route tree (this
 * file isn't named page.tsx) so it's hidden from the product entirely for
 * now. `page.tsx` in this folder just redirects away instead of rendering
 * this. To bring Analytics back: rename this file to page.tsx (replacing
 * the redirect stub), and uncomment its nav entry in
 * app/dashboard/vendor/layout.tsx.
 */
export default function AnalyticsPageContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (user) fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/vendor/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#2C2621]" />
          </div>
        </div>
      </div>
    );
  }

  const { entitlements } = analytics;

  return (
    <div className="min-h-screen bg-[#FDFBF7] rounded-3xl pt-8 sm:pt-12 px-4 sm:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Analytics</h1>
            <p className="text-[#6B5E54] font-body">
              Track your business performance and engagement.{' '}
              {analytics.plan.code !== 'PREMIUM' && (
                <Link href="/pricing" className="text-[#C4975A] underline underline-offset-2 font-medium">
                  Upgrade for deeper insights
                </Link>
              )}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-[#CDC0B0]/50 shadow-sm inline-flex">
            {['7', '30', '90', '365'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg font-body font-medium transition-colors text-sm ${
                  period === days
                    ? 'bg-[#C4975A] text-white shadow-sm'
                    : 'bg-transparent text-[#6B5E54] hover:bg-[#FDFBF7]'
                }`}
              >
                {days === '7' ? '7D' : days === '30' ? '30D' : days === '90' ? '90D' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards -- always available, every tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={MessageSquare} label="Total Quotes" value={analytics.totalQuotes} />

          {entitlements.profileViewsCount ? (
            <StatCard icon={Eye} label="Profile Views" value={analytics.totalViews ?? 0} />
          ) : (
            <LockedOverlay label="Upgrade to see profile views">
              <StatCard icon={Eye} label="Profile Views" value={0} />
            </LockedOverlay>
          )}

          <StatCard icon={Star} label="Average Rating" value={analytics.averageRating.toFixed(1)} />
          <StatCard icon={Calendar} label="Total Reviews" value={analytics.totalReviews} />
        </div>

        {/* Conversion + Favorites -- Premium */}
        {(entitlements.conversionInsights || entitlements.favoritesInsights) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entitlements.conversionInsights ? (
              <StatCard icon={Percent} label="Conversion Rate" value={`${(analytics.conversionRatePct ?? 0).toFixed(1)}%`}
                hint="Views that turned into a quote request" />
            ) : (
              <LockedOverlay label="Upgrade to see your conversion rate">
                <StatCard icon={Percent} label="Conversion Rate" value="0.0%" />
              </LockedOverlay>
            )}

            {entitlements.favoritesInsights ? (
              <StatCard icon={Heart} label="Favorites" value={analytics.favoritesCount ?? 0}
                hint="Customers who saved your business" />
            ) : (
              <LockedOverlay label="Upgrade to see who favorited you">
                <StatCard icon={Heart} label="Favorites" value={0} />
              </LockedOverlay>
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Requests Chart -- Basic+ */}
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <MessageSquare className="h-5 w-5 text-[#C4975A]" />
                Quote Requests Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entitlements.quoteTrend ? (
                analytics.quoteTrend && analytics.quoteTrend.length > 0 ? (
                  <BarChart data={analytics.quoteTrend} unit="quotes" color="#CDB79E" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-[#9C8E82] font-body">No data yet</div>
                )
              ) : (
                <LockedOverlay label="Upgrade to Basic to see this trend">
                  <BarChart data={PLACEHOLDER_TREND} unit="quotes" color="#CDB79E" />
                </LockedOverlay>
              )}
            </CardContent>
          </Card>

          {/* Profile Views Chart -- Premium */}
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <Eye className="h-5 w-5 text-[#C4975A]" />
                Profile Views Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entitlements.viewsTrend ? (
                analytics.viewsTrend && analytics.viewsTrend.length > 0 ? (
                  <BarChart data={analytics.viewsTrend} unit="views" color="#EEDDCC" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-[#9C8E82] font-body">No data yet</div>
                )
              ) : (
                <LockedOverlay label="Upgrade to Premium to see this trend">
                  <BarChart data={PLACEHOLDER_TREND} unit="views" color="#EEDDCC" />
                </LockedOverlay>
              )}
            </CardContent>
          </Card>

          {/* Rating Trend Chart -- Premium */}
          <Card className="lg:col-span-2 border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <Star className="h-5 w-5 text-[#C4975A]" />
                Rating Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entitlements.ratingTrend ? (
                analytics.ratingTrend && analytics.ratingTrend.length > 0 ? (
                  <div className="h-64 flex items-end justify-between gap-1">
                    {analytics.ratingTrend.map((data, index) => {
                      const height = (data.rating / 5) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center min-w-0">
                          <div className="w-full bg-gradient-to-t from-[#EEDDCC] to-[#C4975A] rounded-t-sm relative group"
                            style={{ height: `${height}%`, minHeight: data.rating > 0 ? '20px' : '4px' }}
                          >
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2C2621] text-[#FDFBF7] font-body text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg left-1/2 -translate-x-1/2">
                              {data.rating.toFixed(1)} ★
                            </div>
                          </div>
                          <span className="text-[10px] font-body font-medium text-[#9C8E82] mt-2 hidden sm:block">
                            {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-[#9C8E82] font-body">No data yet</div>
                )
              ) : (
                <LockedOverlay label="Upgrade to Premium to see your rating trend">
                  <BarChart data={PLACEHOLDER_TREND} unit="★" color="#D4A373" />
                </LockedOverlay>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Favorites -- Premium */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
              <Heart className="h-5 w-5 text-[#C4975A]" />
              Recent Favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {entitlements.favoritesInsights ? (
              analytics.recentFavorites && analytics.recentFavorites.length > 0 ? (
                <div className="divide-y divide-[#CDC0B0]/40">
                  {analytics.recentFavorites.map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FDF2F2] flex items-center justify-center">
                          <Heart className="w-4 h-4 text-[#B85C5C] fill-current" />
                        </div>
                        <span className="font-body text-sm text-[#2C2621]">{f.customerName}</span>
                      </div>
                      <span className="font-body text-xs text-[#9C8E82]">
                        {new Date(f.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-[#9C8E82] font-body">No favorites yet — they'll show up here as customers save your business.</p>
              )
            ) : (
              <LockedOverlay label="Upgrade to Premium to see who favorited you, and get notified instantly">
                <div className="space-y-3">
                  {['Aarav Sharma', 'Priya Nair', 'Rahul Verma'].map((name) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FDF2F2] flex items-center justify-center">
                        <Heart className="w-4 h-4 text-[#B85C5C] fill-current" />
                      </div>
                      <span className="font-body text-sm text-[#2C2621]">{name}</span>
                    </div>
                  ))}
                </div>
              </LockedOverlay>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: string | number; hint?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm hover:shadow-warm-md transition-all overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30 group-hover:bg-[#EEDDCC] transition-colors">
              <Icon className="h-6 w-6 text-[#C4975A]" />
            </div>
            <TrendingUp className="h-5 w-5 text-[#8A9A5B]" />
          </div>
          <p className="text-sm font-body font-medium text-[#9C8E82] mb-1 uppercase tracking-wider">{label}</p>
          <p className="text-4xl font-heading font-bold text-[#2C2621]">{value}</p>
          {hint && <p className="text-xs font-body text-[#9C8E82] mt-1">{hint}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
