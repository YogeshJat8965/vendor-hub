'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  DollarSign,
  Star,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Clock,
  ArrowRight,
  Loader2,
  Activity,
  ListChecks,
  MessageSquare,
  UserPlus,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSectionCard,
  AdminEmptyState,
} from '@/components/admin';

interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalAdmins: number;
  bannedUsers: number;
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  totalQuotes: number;
  quotesByStatus: Record<string, number>;
  completedQuotes: number;
  awaitingConfirmation: number;
  openDisputes: number;
  completionRate: number | null;
  totalReviews: number;
  flaggedReviews: number;
  averageRating: number | null;
  totalConversations: number;
  /** MRR in paise, computed from real PaymentTransaction records. */
  totalRevenue: number | null;
  revenue: {
    mrrPaise: number;
    totalCollectedPaise: number;
    refundedPaise: number;
    payingSubscribers: number;
    successfulTransactionCount: number;
  };
  /** Percent vs the previous window; null when that window has no records. */
  growth: Record<string, number | null>;
  newThisPeriod: Record<string, number>;
  periodDays: number;
}

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

interface PendingAction {
  id: string;
  type: 'vendor_approval' | 'flagged_review' | 'dispute';
  title: string;
  description: string;
  time: string | null;
  priority: 'high' | 'medium' | 'low';
  link: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  action: string;
  subject: string | null;
  detail: string | null;
  time: string | null;
  status: 'success' | 'warning' | 'error' | 'info';
  link: string;
}

const ACTION_ICONS = {
  vendor_approval: Building2,
  flagged_review: Flag,
  dispute: AlertTriangle,
} as const;

const ACTIVITY_ICONS: Record<string, typeof Users> = {
  user_signup: UserPlus,
  vendor_signup: Building2,
  quote_created: FileText,
  quote_completed: CheckCircle2,
  quote_disputed: AlertTriangle,
  review_posted: Star,
  review_flagged: Flag,
};

const ACTIVITY_TONES: Record<string, string> = {
  success: 'bg-[#5B8C5A]/12 text-[#5B8C5A]',
  warning: 'bg-[#C4975A]/14 text-[#C4975A]',
  error: 'bg-[#B85C5C]/12 text-[#B85C5C]',
  info: 'bg-[#E7DBCD] text-[#6B5E54]',
};

function timeAgo(timestamp: string | null) {
  if (!timestamp) return 'Recently';
  const past = new Date(timestamp);
  if (Number.isNaN(past.getTime())) return 'Recently';

  const diffMs = Date.now() - past.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, actionsRes, activityRes] = await Promise.all([
        apiClient.get('/admin/dashboard?days=30'),
        apiClient.get('/admin/pending-actions'),
        apiClient.get('/admin/recent-activity?limit=8'),
      ]);
      setStats(statsRes.data);
      setPendingActions(actionsRes.data || []);
      setRecentActivity(activityRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  const growth = stats?.growth ?? {};
  const newThisPeriod = stats?.newThisPeriod ?? {};

  return (
    // No wrapper of its own: the admin layout's <main> already supplies the
    // background, padding and max-width.
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description={`Platform overview — last ${stats?.periodDays ?? 30} days`}
      />

      {/* Headline figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Users"
          value={stats?.totalUsers?.toLocaleString()}
          icon={Users}
          tone="accent"
          changePercent={growth.users}
          hint={`${stats?.totalCustomers ?? 0} customers · ${stats?.totalAdmins ?? 0} admins${
            newThisPeriod.users ? ` · ${newThisPeriod.users} new` : ''
          }`}
        />
        <AdminStatCard
          label="Active Vendors"
          value={stats?.activeVendors?.toLocaleString()}
          icon={Building2}
          tone="success"
          changePercent={growth.vendors}
          hint={`${stats?.totalVendors ?? 0} total${
            stats?.pendingVendors ? ` · ${stats.pendingVendors} awaiting approval` : ''
          }`}
        />
        <AdminStatCard
          label="Total Quotes"
          value={stats?.totalQuotes?.toLocaleString()}
          icon={FileText}
          tone="warning"
          changePercent={growth.quotes}
          hint={
            stats?.completionRate !== null && stats?.completionRate !== undefined
              ? `${stats.completionRate}% completed`
              : undefined
          }
        />
        <AdminStatCard
          label="Avg Rating"
          value={stats?.averageRating?.toFixed(1)}
          icon={Star}
          tone="accent"
          hint={`across ${stats?.totalReviews ?? 0} reviews`}
        />
      </div>

      {/* Operational figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Completed"
          value={stats?.completedQuotes?.toLocaleString()}
          icon={CheckCircle2}
          tone="success"
          hint="delivered and confirmed"
        />
        <AdminStatCard
          label="Awaiting Confirmation"
          value={stats?.awaitingConfirmation?.toLocaleString()}
          icon={Truck}
          tone={stats?.awaitingConfirmation ? 'warning' : 'neutral'}
          hint="delivered, pending customer sign-off"
        />
        <AdminStatCard
          label="Open Disputes"
          value={stats?.openDisputes?.toLocaleString()}
          icon={AlertTriangle}
          tone={stats?.openDisputes ? 'danger' : 'neutral'}
          hint="auto-complete is blocked while open"
        />
        <AdminStatCard
          label="MRR"
          value={stats?.revenue ? `₹${rupees(stats.revenue.mrrPaise)}` : undefined}
          icon={DollarSign}
          tone={stats?.revenue?.mrrPaise ? 'success' : 'neutral'}
          hint={stats?.revenue
            ? `₹${rupees(stats.revenue.totalCollectedPaise)} collected all-time · ${stats.revenue.payingSubscribers} paying`
            : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <AdminSectionCard
          title="Pending Actions"
          icon={ListChecks}
          contentClassName="p-0"
          action={
            <Badge variant={pendingActions.length ? 'destructive' : 'success'}>
              {pendingActions.length}
            </Badge>
          }
        >
          {pendingActions.length === 0 ? (
            <AdminEmptyState
              icon={CheckCircle2}
              title="All caught up"
              description="No vendors awaiting approval, no flagged reviews and no open disputes."
            />
          ) : (
            <div className="divide-y divide-[#CDC0B0]/40">
              {pendingActions.map((item) => {
                const Icon = ACTION_ICONS[item.type] ?? AlertTriangle;
                const isHigh = item.priority === 'high';

                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-start gap-3.5 px-5 py-4 hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isHigh ? 'bg-[#B85C5C]/12 text-[#B85C5C]' : 'bg-[#C4975A]/14 text-[#C4975A]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-sm text-[#2C2621]">{item.title}</h4>
                      <p className="font-body text-sm text-[#6B5E54] mt-0.5 break-words">{item.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9C8E82]" />
                        <span className="font-body text-xs text-[#9C8E82]">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9C8E82] shrink-0 mt-1 group-hover:text-[#C4975A] transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </AdminSectionCard>

        {/* Recent Activity */}
        <AdminSectionCard title="Recent Activity" icon={Activity} contentClassName="p-0">
          {recentActivity.length === 0 ? (
            <AdminEmptyState
              icon={Activity}
              title="No recent activity"
              description="New signups, quotes and reviews will appear here as they happen."
            />
          ) : (
            <div className="divide-y divide-[#CDC0B0]/40">
              {recentActivity.map((event) => {
                const Icon = ACTIVITY_ICONS[event.type] ?? MessageSquare;

                return (
                  <Link
                    key={event.id}
                    href={event.link}
                    className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-[#FDFBF7] transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        ACTIVITY_TONES[event.status] ?? ACTIVITY_TONES.info
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-[#2C2621]">{event.action}</p>
                      <p className="font-body text-sm text-[#6B5E54] truncate">
                        {event.subject}
                        {event.detail ? ` — ${event.detail}` : ''}
                      </p>
                    </div>
                    <span className="font-body text-xs text-[#9C8E82] shrink-0 mt-0.5">
                      {timeAgo(event.time)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </AdminSectionCard>
      </div>

      {/* Quick Actions */}
      <AdminSectionCard title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: '/dashboard/admin/vendors',
              icon: Building2,
              label: 'Manage Vendors',
              count: stats?.pendingVendors,
              countLabel: 'pending',
            },
            {
              href: '/dashboard/admin/users',
              icon: Users,
              label: 'Manage Users',
              count: stats?.bannedUsers,
              countLabel: 'banned',
            },
            {
              href: '/dashboard/admin/reviews',
              icon: Flag,
              label: 'Flagged Reviews',
              count: stats?.flaggedReviews,
              countLabel: 'flagged',
            },
            {
              href: '/dashboard/admin/disputes',
              icon: AlertTriangle,
              label: 'Disputes',
              count: stats?.openDisputes,
              countLabel: 'open',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-5 flex flex-col items-center gap-2 hover:border-[#C4975A] hover:text-[#2C2621]"
                >
                  <Icon className="w-6 h-6 text-[#9C8E82]" />
                  <span className="font-body font-medium text-sm">{item.label}</span>
                  {!!item.count && (
                    <Badge variant="warning">
                      {item.count} {item.countLabel}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </AdminSectionCard>
    </div>
  );
}
