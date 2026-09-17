'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Store,
  Star,
  DollarSign,
  Loader2,
  Download,
  FileText,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSectionCard,
  AdminEmptyState,
  exportToCsv,
} from '@/components/admin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';

interface SeriesPoint {
  date: string;
  [key: string]: string | number;
}

interface AnalyticsData {
  totals: {
    totalUsers: number;
    totalCustomers: number;
    totalVendors: number;
    activeVendors: number;
    totalQuotes: number;
    completedQuotes: number;
    completionRate: number | null;
    totalReviews: number;
    averageRating: number | null;
    totalRevenue: number | null;
    revenue: {
      mrrPaise: number;
      totalCollectedPaise: number;
      refundedPaise: number;
      payingSubscribers: number;
      byPlan: { planCode: string; amountPaise: number }[];
      successfulTransactionCount: number;
    };
    growth: Record<string, number | null>;
    newThisPeriod: Record<string, number>;
  };
  userGrowth: SeriesPoint[];
  quoteActivity: SeriesPoint[];
  reviewActivity: SeriesPoint[];
  revenueActivity: { date: string; amountPaise: number }[];
  quotesByStatus: { status: string; count: number }[];
  vendorsByType: { type: string; count: number }[];
  periodDays: number;
  granularity: 'day' | 'week' | 'month';
}

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const CHART_COLORS = {
  customers: '#C4975A',
  vendors: '#8A7BA8',
  created: '#6B8CAE',
  completed: '#5B8C5A',
  reviews: '#CDB79E',
  flagged: '#B85C5C',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: '#6B8CAE',
  IN_PROGRESS: '#6B8CAE',
  QUOTED: '#C4975A',
  ACCEPTED: '#8A7BA8',
  DELIVERED: '#CDB79E',
  DISPUTED: '#B85C5C',
  COMPLETED: '#5B8C5A',
  REJECTED: '#B85C5C',
  CLOSED: '#9C8E82',
};

/** Shared axis/grid styling so all the charts read as one family. */
const axisProps = {
  stroke: '#9C8E82',
  fontSize: 12,
  tickLine: false,
  axisLine: { stroke: '#CDC0B0' },
} as const;

const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #CDC0B0',
    borderRadius: '12px',
    fontSize: '13px',
    boxShadow: '0 4px 16px rgba(44,38,33,0.08)',
  },
  labelStyle: { color: '#2C2621', fontWeight: 600 },
} as const;

/** True when every point in the series is zero — i.e. there is nothing to plot. */
function isEmptySeries(series: SeriesPoint[], keys: string[]) {
  return !series?.length || series.every((point) => keys.every((key) => !point[key]));
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [days, setDays] = useState('365');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/admin/analytics?days=${days}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, fetchAnalytics]);

  const exportReport = () => {
    if (!analytics) return;

    // One row per bucket, joining every series on its shared date label, so
    // the export matches exactly what the charts above are showing.
    const rows = analytics.userGrowth.map((point, index) => ({
      date: point.date,
      customers: point.customers ?? 0,
      vendors: point.vendors ?? 0,
      quotesCreated: analytics.quoteActivity[index]?.created ?? 0,
      quotesCompleted: analytics.quoteActivity[index]?.completed ?? 0,
      reviews: analytics.reviewActivity[index]?.reviews ?? 0,
      flagged: analytics.reviewActivity[index]?.flagged ?? 0,
    }));

    const ok = exportToCsv(`vendorhub-analytics-${days}d`, rows, [
      { header: 'Period', value: (r) => r.date },
      { header: 'New customers', value: (r) => r.customers },
      { header: 'New vendors', value: (r) => r.vendors },
      { header: 'Quotes created', value: (r) => r.quotesCreated },
      { header: 'Quotes completed', value: (r) => r.quotesCompleted },
      { header: 'Reviews posted', value: (r) => r.reviews },
      { header: 'Reviews flagged', value: (r) => r.flagged },
    ]);

    if (ok) toast.success('Analytics report downloaded');
    else toast.error('Nothing to export for this period');
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  const { totals, granularity } = analytics;
  const bucketWord = granularity === 'day' ? 'day' : granularity === 'week' ? 'week' : 'month';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Analytics"
        description={`Computed from stored timestamps — grouped by ${bucketWord}`}
        actions={
          <>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-40 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="730">Last 2 years</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatCard
          label="Total Users"
          value={totals.totalUsers?.toLocaleString()}
          icon={Users}
          tone="accent"
          changePercent={totals.growth?.users}
          hint={`${totals.newThisPeriod?.users ?? 0} joined this period`}
        />
        <AdminStatCard
          label="Active Vendors"
          value={totals.activeVendors?.toLocaleString()}
          icon={Store}
          tone="success"
          changePercent={totals.growth?.vendors}
          hint={`${totals.newThisPeriod?.vendors ?? 0} joined this period`}
        />
        <AdminStatCard
          label="Total Quotes"
          value={totals.totalQuotes?.toLocaleString()}
          icon={FileText}
          tone="warning"
          changePercent={totals.growth?.quotes}
          hint={`${totals.newThisPeriod?.quotes ?? 0} raised this period`}
        />
        <AdminStatCard
          label="Completed Quotes"
          value={totals.completedQuotes?.toLocaleString()}
          icon={CheckCircle2}
          tone="success"
          hint={
            totals.completionRate !== null && totals.completionRate !== undefined
              ? `${totals.completionRate}% completion rate`
              : undefined
          }
        />
        <AdminStatCard
          label="Average Rating"
          value={totals.averageRating?.toFixed(1)}
          icon={Star}
          tone="accent"
          hint={`across ${totals.totalReviews ?? 0} reviews`}
        />
        <AdminStatCard
          label="MRR"
          value={`₹${rupees(totals.revenue.mrrPaise)}`}
          icon={DollarSign}
          tone={totals.revenue.mrrPaise ? 'success' : 'neutral'}
          hint={`${totals.revenue.payingSubscribers} paying subscriber${totals.revenue.payingSubscribers === 1 ? '' : 's'}`}
        />
      </div>

      {/* Revenue */}
      <AdminSectionCard title="Revenue" icon={DollarSign}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-4">
            <p className="text-xs text-[#9C8E82]">Collected all-time</p>
            <p className="font-heading text-2xl font-bold text-[#2C2621] tabular-nums">₹{rupees(totals.revenue.totalCollectedPaise)}</p>
          </div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-4">
            <p className="text-xs text-[#9C8E82]">Refunded all-time</p>
            <p className="font-heading text-2xl font-bold text-[#2C2621] tabular-nums">₹{rupees(totals.revenue.refundedPaise)}</p>
          </div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-4">
            <p className="text-xs text-[#9C8E82]">Successful payments</p>
            <p className="font-heading text-2xl font-bold text-[#2C2621] tabular-nums">{totals.revenue.successfulTransactionCount}</p>
          </div>
        </div>
        {isEmptySeries(analytics.revenueActivity as unknown as SeriesPoint[], ['amountPaise']) ? (
          <AdminEmptyState
            icon={DollarSign}
            title="No revenue in this period"
            description="Widen the date range, or this reflects that no plans have been purchased yet."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.revenueActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `₹${rupees(v)}`} />
              <Tooltip {...tooltipStyle} formatter={(value?: number) => [`₹${rupees(value ?? 0)}`, 'Revenue']} cursor={{ fill: '#E7DBCD', opacity: 0.4 }} />
              <Bar dataKey="amountPaise" fill={CHART_COLORS.completed} name="Revenue" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {totals.revenue.byPlan.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#CDC0B0]/40">
            <p className="font-body text-sm font-medium text-[#2C2621] mb-3">Revenue by plan</p>
            <div className="space-y-2">
              {totals.revenue.byPlan.map((row) => (
                <div key={row.planCode} className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#6B5E54]">{row.planCode}</span>
                  <span className="font-body text-sm font-medium text-[#2C2621] tabular-nums">₹{rupees(row.amountPaise)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminSectionCard>

      {/* User growth */}
      <AdminSectionCard title="User Growth" icon={TrendingUp}>
        {isEmptySeries(analytics.userGrowth, ['customers', 'vendors']) ? (
          <AdminEmptyState
            icon={TrendingUp}
            title="No signups in this period"
            description="Widen the date range to see earlier activity."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Line type="monotone" dataKey="customers" stroke={CHART_COLORS.customers} strokeWidth={2.5} name="Customers" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="vendors" stroke={CHART_COLORS.vendors} strokeWidth={2.5} name="Vendors" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>

      {/* Quote activity */}
      <AdminSectionCard title="Quote Activity" icon={FileText}>
        {isEmptySeries(analytics.quoteActivity, ['created', 'completed']) ? (
          <AdminEmptyState
            icon={FileText}
            title="No quote activity in this period"
            description="Widen the date range to see earlier activity."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.quoteActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: '#E7DBCD', opacity: 0.4 }} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="created" fill={CHART_COLORS.created} name="Raised" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill={CHART_COLORS.completed} name="Completed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote pipeline distribution */}
        <AdminSectionCard title="Quote Pipeline" icon={FileText}>
          {analytics.quotesByStatus.length === 0 ? (
            <AdminEmptyState icon={FileText} title="No quotes yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.quotesByStatus} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis type="category" dataKey="status" width={90} {...axisProps} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#E7DBCD', opacity: 0.4 }} />
                <Bar dataKey="count" name="Quotes" radius={[0, 6, 6, 0]}>
                  {analytics.quotesByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#9C8E82'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminSectionCard>

        {/* Vendors by type */}
        <AdminSectionCard title="Vendors by Type" icon={Store}>
          {analytics.vendorsByType.length === 0 ? (
            <AdminEmptyState icon={Store} title="No vendors yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.vendorsByType} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis type="category" dataKey="type" width={120} {...axisProps} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#E7DBCD', opacity: 0.4 }} />
                <Bar dataKey="count" fill={CHART_COLORS.vendors} name="Vendors" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminSectionCard>
      </div>

      {/* Reviews */}
      <AdminSectionCard title="Review Activity" icon={Star}>
        {isEmptySeries(analytics.reviewActivity, ['reviews', 'flagged']) ? (
          <AdminEmptyState
            icon={Star}
            title="No reviews in this period"
            description="Widen the date range to see earlier activity."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.reviewActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CDC0B0" opacity={0.4} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Line type="monotone" dataKey="reviews" stroke={CHART_COLORS.reviews} strokeWidth={2.5} name="Posted" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="flagged" stroke={CHART_COLORS.flagged} strokeWidth={2.5} name="Flagged" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>
    </div>
  );
}
