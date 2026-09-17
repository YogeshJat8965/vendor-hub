'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  Users,
  IndianRupee,
  Clock,
  AlertTriangle,
  Gift,
  Ban,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminFilterBar,
  AdminDataTable,
  AdminStatusBadge,
  AdminConfirmDialog,
  exportToCsv,
  type Column,
  type FilterPill,
} from '@/components/admin';

interface Subscription {
  id: string;
  vendorId: string;
  planCode: string;
  status: string;
  amountPaidPaise: number;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  cancelledAt?: string | null;
  source: string;
  adminNote?: string | null;
  createdAt: string;
}

interface SubRow {
  subscription: Subscription;
  vendorName: string;
  vendorEmail: string | null;
  vendorSlug: string | null;
}

interface Plan {
  code: string;
  name: string;
  badgeColor?: string;
}

interface AdminVendor {
  id: string;
  displayName: string;
  email: string;
}

type PillValue = 'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'expiring';

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(value?: string | null) {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [pill, setPill] = useState<PillValue>('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [detail, setDetail] = useState<SubRow | null>(null);
  const [actionDialog, setActionDialog] = useState<'cancel' | 'refund' | null>(null);
  const [reason, setReason] = useState('');

  const [grantOpen, setGrantOpen] = useState(false);
  const [grantVendorQuery, setGrantVendorQuery] = useState('');
  const [grantVendorId, setGrantVendorId] = useState('');
  const [grantPlanCode, setGrantPlanCode] = useState('');
  const [grantDays, setGrantDays] = useState('30');
  const [grantReason, setGrantReason] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [subsRes, plansRes, vendorsRes] = await Promise.all([
        apiClient.get('/admin/subscriptions'),
        apiClient.get('/admin/plans'),
        apiClient.get('/admin/vendors'),
      ]);
      setRows(subsRes.data || []);
      setPlans((plansRes.data || []).map((r: any) => r.plan));
      setVendors(vendorsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const planByCode = useMemo(() => Object.fromEntries(plans.map((p) => [p.code, p])), [plans]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    let expiringSoon = 0;
    for (const r of rows) {
      c[r.subscription.status] = (c[r.subscription.status] ?? 0) + 1;
      const days = daysUntil(r.subscription.currentPeriodEnd);
      if (r.subscription.status === 'ACTIVE' && days !== null && days <= 7 && days >= 0) expiringSoon++;
    }
    c.expiring = expiringSoon;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (pill === 'expiring') {
        const days = daysUntil(r.subscription.currentPeriodEnd);
        if (!(r.subscription.status === 'ACTIVE' && days !== null && days <= 7 && days >= 0)) return false;
      } else if (pill !== 'all' && r.subscription.status !== pill) {
        return false;
      }
      if (planFilter !== 'all' && r.subscription.planCode !== planFilter) return false;
      if (!query) return true;
      return [r.vendorName, r.vendorEmail].some((f) => f?.toLowerCase().includes(query));
    });
  }, [rows, pill, planFilter, search]);

  const pills: FilterPill<PillValue>[] = [
    { value: 'all', label: 'All', count: counts.all ?? 0 },
    { value: 'ACTIVE', label: 'Active', count: counts.ACTIVE ?? 0 },
    { value: 'expiring', label: 'Expiring in 7 days', count: counts.expiring ?? 0, tone: 'warning' },
    { value: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED ?? 0 },
    { value: 'EXPIRED', label: 'Expired', count: counts.EXPIRED ?? 0 },
  ];

  const totalMrrPaise = rows
    .filter((r) => r.subscription.status === 'ACTIVE' && r.subscription.source === 'PURCHASE')
    .reduce((sum, r) => sum + (r.subscription.billingPeriod === 'YEARLY'
      ? Math.round(r.subscription.amountPaidPaise / 12)
      : r.subscription.amountPaidPaise), 0);
  const compedCount = rows.filter((r) => r.subscription.source === 'ADMIN_GRANT' && r.subscription.status === 'ACTIVE').length;

  const runCancel = async () => {
    if (!detail) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/subscriptions/${detail.subscription.id}/cancel`, { reason });
      toast.success('Auto-renew turned off — vendor keeps access until the period ends');
      await fetchAll();
      setActionDialog(null);
      setDetail(null);
      setReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to cancel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runRefund = async () => {
    if (!detail) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/subscriptions/${detail.subscription.id}/refund`, { reason });
      toast.success('Refunded — subscription ended immediately');
      await fetchAll();
      setActionDialog(null);
      setDetail(null);
      setReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runGrant = async () => {
    if (!grantVendorId || !grantPlanCode || !grantReason.trim()) {
      toast.error('Vendor, plan and a reason are all required');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/subscriptions/grant', {
        vendorId: grantVendorId,
        planCode: grantPlanCode,
        durationDays: Number(grantDays) || 30,
        reason: grantReason,
      });
      toast.success('Plan granted');
      await fetchAll();
      setGrantOpen(false);
      setGrantVendorId('');
      setGrantPlanCode('');
      setGrantDays('30');
      setGrantReason('');
      setGrantVendorQuery('');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to grant plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ok = exportToCsv(`vendorhub-subscriptions-${pill.toLowerCase()}`, filtered, [
      { header: 'Vendor', value: (r) => r.vendorName },
      { header: 'Email', value: (r) => r.vendorEmail ?? '' },
      { header: 'Plan', value: (r) => r.subscription.planCode },
      { header: 'Status', value: (r) => r.subscription.status },
      { header: 'Amount paid', value: (r) => `₹${rupees(r.subscription.amountPaidPaise)}` },
      { header: 'Billing period', value: (r) => r.subscription.billingPeriod },
      { header: 'Source', value: (r) => r.subscription.source },
      { header: 'Period end', value: (r) => formatDate(r.subscription.currentPeriodEnd) },
      { header: 'Auto-renew', value: (r) => (r.subscription.autoRenew ? 'Yes' : 'No') },
    ]);
    if (ok) toast.success(`Exported ${filtered.length} subscription${filtered.length === 1 ? '' : 's'}`);
    else toast.error('Nothing to export — no subscriptions match the current filters');
  };

  const filteredVendorOptions = vendors.filter((v) =>
    v.displayName?.toLowerCase().includes(grantVendorQuery.toLowerCase())
    || v.email?.toLowerCase().includes(grantVendorQuery.toLowerCase())
  ).slice(0, 8);

  const columns: Column<SubRow>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      sortValue: (r) => r.vendorName?.toLowerCase() ?? '',
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-[#2C2621] truncate">{r.vendorName}</p>
          <p className="text-xs text-[#9C8E82] truncate">{r.vendorEmail}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      sortValue: (r) => r.subscription.planCode,
      cell: (r) => {
        const plan = planByCode[r.subscription.planCode];
        return (
          <Badge
            variant="outline"
            style={plan?.badgeColor ? { borderColor: plan.badgeColor, color: plan.badgeColor } : undefined}
          >
            {plan?.name ?? r.subscription.planCode}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.subscription.status,
      cell: (r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <AdminStatusBadge status={r.subscription.status} />
          {r.subscription.source === 'ADMIN_GRANT' && <Badge variant="secondary"><Gift className="w-3 h-3" />Comped</Badge>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Paid',
      sortValue: (r) => r.subscription.amountPaidPaise,
      hideOnMobile: true,
      cell: (r) => <span className="text-sm text-[#6B5E54] tabular-nums">₹{rupees(r.subscription.amountPaidPaise)}</span>,
    },
    {
      key: 'periodEnd',
      header: 'Period end',
      sortValue: (r) => new Date(r.subscription.currentPeriodEnd).getTime() || 0,
      hideOnMobile: true,
      cell: (r) => {
        const days = daysUntil(r.subscription.currentPeriodEnd);
        const soon = r.subscription.status === 'ACTIVE' && days !== null && days <= 7 && days >= 0;
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#6B5E54]">{formatDate(r.subscription.currentPeriodEnd)}</span>
            {soon && <AlertTriangle className="w-3.5 h-3.5 text-[#C4975A]" />}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetail(r); }}>
            <Eye className="w-4 h-4" />
          </Button>
          {r.subscription.status === 'ACTIVE' && r.subscription.autoRenew && (
            <Button variant="ghost" size="sm"
              onClick={(e) => { e.stopPropagation(); setDetail(r); setActionDialog('cancel'); setReason(''); }}>
              <Ban className="w-4 h-4" />
            </Button>
          )}
          {r.subscription.status === 'ACTIVE' && r.subscription.source === 'PURCHASE' && (
            <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
              onClick={(e) => { e.stopPropagation(); setDetail(r); setActionDialog('refund'); setReason(''); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        description="Every vendor subscription — grant, cancel or refund manually"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>Export CSV</Button>
            <Button onClick={() => setGrantOpen(true)}>
              <Gift className="w-4 h-4" />
              Grant a plan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Total Subscriptions" value={counts.all ?? 0} icon={Users} tone="accent" />
        <AdminStatCard label="Active" value={counts.ACTIVE ?? 0} icon={Users} tone="success" />
        <AdminStatCard
          label="MRR (paid, real revenue)"
          value={`₹${rupees(totalMrrPaise)}`}
          icon={IndianRupee}
          tone={totalMrrPaise ? 'success' : 'neutral'}
          hint={compedCount ? `${compedCount} comped plan(s) excluded` : undefined}
        />
        <AdminStatCard
          label="Expiring in 7 days"
          value={counts.expiring ?? 0}
          icon={Clock}
          tone={counts.expiring ? 'warning' : 'neutral'}
        />
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by vendor name or email…"
        pills={pills}
        activePill={pill}
        onPillChange={(value) => setPill(value)}
      >
        {plans.length > 0 && (
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-44 h-11">
              <SelectValue placeholder="All plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.subscription.id}
        isLoading={isLoading}
        onRowClick={setDetail}
        pageSize={15}
        emptyTitle="No subscriptions match these filters"
        emptyDescription="Try a different status or clear the search."
      />

      {/* Detail / actions */}
      <Dialog open={Boolean(detail) && actionDialog === null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.vendorName}</DialogTitle>
            <DialogDescription>{detail?.vendorEmail}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Fact label="Plan" value={planByCode[detail.subscription.planCode]?.name ?? detail.subscription.planCode} />
                <Fact label="Status" value={<AdminStatusBadge status={detail.subscription.status} />} />
                <Fact label="Amount paid" value={`₹${rupees(detail.subscription.amountPaidPaise)}`} />
                <Fact label="Billing period" value={detail.subscription.billingPeriod} />
                <Fact label="Period start" value={formatDate(detail.subscription.currentPeriodStart)} />
                <Fact label="Period end" value={formatDate(detail.subscription.currentPeriodEnd)} />
                <Fact label="Auto-renew" value={detail.subscription.autoRenew ? 'Yes' : 'No'} />
                <Fact label="Source" value={detail.subscription.source === 'ADMIN_GRANT' ? 'Admin grant' : 'Real purchase'} />
              </div>
              {detail.subscription.adminNote && (
                <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-3">
                  <p className="text-xs text-[#9C8E82] mb-1">Admin notes</p>
                  <p className="text-sm text-[#2C2621] break-words">{detail.subscription.adminNote}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {detail.subscription.status === 'ACTIVE' && detail.subscription.autoRenew && (
                  <Button variant="outline" className="flex-1" onClick={() => { setActionDialog('cancel'); setReason(''); }}>
                    Cancel auto-renew
                  </Button>
                )}
                {detail.subscription.status === 'ACTIVE' && detail.subscription.source === 'PURCHASE' && (
                  <Button variant="outline" className="flex-1 text-[#B85C5C] border-[#B85C5C]/30 hover:bg-[#B85C5C] hover:text-white"
                    onClick={() => { setActionDialog('refund'); setReason(''); }}>
                    Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={actionDialog === 'cancel'}
        onOpenChange={(open) => !open && setActionDialog(null)}
        title={`Cancel auto-renew for ${detail?.vendorName}?`}
        description="They keep their plan until the current period ends, then drop to the default tier."
        confirmLabel="Cancel auto-renew"
        isSubmitting={isSubmitting}
        onConfirm={runCancel}
      >
        <div>
          <Label htmlFor="cancel-reason" className="mb-2">Reason (optional, shown to the vendor)</Label>
          <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-20" />
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={actionDialog === 'refund'}
        onOpenChange={(open) => !open && setActionDialog(null)}
        title={`Refund ${detail?.vendorName}?`}
        description="Reverses the payment through the gateway and ends their plan immediately — this is not the same as a scheduled cancellation."
        confirmLabel="Issue refund"
        destructive
        isSubmitting={isSubmitting}
        onConfirm={runRefund}
      >
        <div>
          <Label htmlFor="refund-reason" className="mb-2">Reason (shown to the vendor)</Label>
          <Textarea id="refund-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-20" />
        </div>
      </AdminConfirmDialog>

      {/* Grant */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grant a plan</DialogTitle>
            <DialogDescription>
              No payment involved — this is excluded from revenue. Use it for comps, trials or goodwill.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="grant-vendor" className="mb-2">Vendor</Label>
              <Input
                id="grant-vendor"
                placeholder="Search by name or email…"
                value={grantVendorId ? vendors.find((v) => v.id === grantVendorId)?.displayName ?? grantVendorQuery : grantVendorQuery}
                onChange={(e) => { setGrantVendorQuery(e.target.value); setGrantVendorId(''); }}
                className="h-11"
              />
              {grantVendorQuery && !grantVendorId && filteredVendorOptions.length > 0 && (
                <div className="mt-1.5 rounded-xl border border-[#CDC0B0]/50 bg-white divide-y divide-[#CDC0B0]/30 max-h-40 overflow-y-auto">
                  {filteredVendorOptions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setGrantVendorId(v.id); setGrantVendorQuery(v.displayName); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#FDFBF7] transition-colors"
                    >
                      <p className="text-[#2C2621]">{v.displayName}</p>
                      <p className="text-xs text-[#9C8E82]">{v.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grant-plan" className="mb-2">Plan</Label>
                <Select value={grantPlanCode} onValueChange={setGrantPlanCode}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grant-days" className="mb-2">Duration (days)</Label>
                <Input id="grant-days" type="number" min={1} max={365} value={grantDays}
                  onChange={(e) => setGrantDays(e.target.value)} className="h-11" />
              </div>
            </div>
            <div>
              <Label htmlFor="grant-reason" className="mb-2">Reason *</Label>
              <Textarea id="grant-reason" value={grantReason} onChange={(e) => setGrantReason(e.target.value)}
                placeholder="Why is this being granted?" className="min-h-20" />
            </div>
            <Button
              onClick={runGrant}
              disabled={isSubmitting || !grantVendorId || !grantPlanCode || !grantReason.trim()}
              className="w-full h-11"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              Grant plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[#9C8E82]">{label}</p>
      <div className="text-sm text-[#2C2621]">{value}</div>
    </div>
  );
}
