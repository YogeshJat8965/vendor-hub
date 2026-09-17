'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Download,
  Building2,
  Clock,
  PauseCircle,
  Undo2,
  Star,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminFilterBar,
  AdminPlanBadge,
  AdminDataTable,
  AdminStatusBadge,
  AdminSectionCard,
  AdminConfirmDialog,
  exportToCsv,
  type Column,
  type FilterPill,
} from '@/components/admin';

interface Vendor {
  id: string;
  slug: string;
  displayName: string;
  storeName?: string;
  businessName?: string;
  ownerName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  vendorType?: string;
  city?: string;
  state?: string;
  /** Real backend values only — there is no "APPROVED" in this data. */
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  subscriptionPlan?: string;
  rating?: number | null;
  reviewCount?: number | null;
  certified?: boolean;
  rejectionReason?: string;
  createdAt: string | null;
}

interface VendorDetail {
  profile: Vendor;
  stats: Record<string, any>;
  quotes: any[];
  reviews: any[];
}

type StatusPill = 'all' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageVendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoApprove, setAutoApprove] = useState<boolean | null>(null);

  const [search, setSearch] = useState('');
  const [pill, setPill] = useState<StatusPill>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [plans, setPlans] = useState<{ code: string; name: string; badgeColor?: string }[]>([]);

  const [selected, setSelected] = useState<Vendor | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'suspend' | 'reinstate' | null>(null);
  const [reason, setReason] = useState('');

  // Bulk selection, scoped to the approval queue where it is actually useful.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<VendorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      const [vendorsRes, settingsRes, plansRes] = await Promise.all([
        apiClient.get('/admin/vendors'),
        // Surfaced on this page because it explains an empty approval queue.
        apiClient.get('/admin/settings').catch(() => null),
        apiClient.get('/admin/plans'),
      ]);
      setVendors(vendorsRes.data || []);
      if (settingsRes) setAutoApprove(settingsRes.data?.autoApproveVendors ?? null);
      setPlans((plansRes.data || []).map((r: any) => r.plan));
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchVendors();
  }, [user, fetchVendors]);

  const counts = useMemo(() => ({
    all: vendors.length,
    PENDING: vendors.filter((v) => v.status === 'PENDING').length,
    ACTIVE: vendors.filter((v) => v.status === 'ACTIVE').length,
    SUSPENDED: vendors.filter((v) => v.status === 'SUSPENDED').length,
    REJECTED: vendors.filter((v) => v.status === 'REJECTED').length,
  }), [vendors]);

  const vendorTypes = useMemo(
    () => [...new Set(vendors.map((v) => v.vendorType).filter(Boolean))].sort() as string[],
    [vendors]
  );

  const pendingQueue = useMemo(() => vendors.filter((v) => v.status === 'PENDING'), [vendors]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vendors.filter((v) => {
      if (pill !== 'all' && v.status !== pill) return false;
      if (typeFilter !== 'all' && v.vendorType !== typeFilter) return false;
      if (planFilter !== 'all' && v.subscriptionPlan !== planFilter) return false;
      if (!query) return true;
      return [v.displayName, v.storeName, v.businessName, v.ownerName, v.email, v.city, v.vendorType, v.slug]
        .some((field) => field?.toLowerCase().includes(query));
    });
  }, [vendors, pill, typeFilter, planFilter, search]);

  const pills: FilterPill<StatusPill>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'PENDING', label: 'Pending', count: counts.PENDING, tone: 'warning' },
    { value: 'ACTIVE', label: 'Active', count: counts.ACTIVE },
    { value: 'SUSPENDED', label: 'Suspended', count: counts.SUSPENDED, tone: 'danger' },
    { value: 'REJECTED', label: 'Rejected', count: counts.REJECTED, tone: 'danger' },
  ];

  const openDetail = async (vendor: Vendor) => {
    setSelected(vendor);
    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/admin/vendors/${vendor.id}/detail`);
      setDetail(res.data);
    } catch (error) {
      console.error('Failed to load vendor detail:', error);
      toast.error('Failed to load vendor details');
    } finally {
      setDetailLoading(false);
    }
  };

  const runAction = async () => {
    if (!selected || !action) return;
    if (action === 'reject' && !reason.trim()) {
      toast.error('Please give a reason — it is sent to the vendor');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = action === 'reject' || action === 'suspend' ? { reason } : undefined;
      await apiClient.put(`/admin/vendors/${selected.id}/${action}`, body);
      toast.success(`${selected.displayName} updated`);
      await fetchVendors();
      setAction(null);
      setSelected(null);
      setReason('');
    } catch (error: any) {
      console.error('Vendor action failed:', error);
      toast.error(error?.response?.data?.error || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runBulk = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === 'reject' && !reason.trim()) {
      toast.error('Please give a reason — it is sent to every vendor rejected');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.put('/admin/vendors/bulk', {
        vendorIds: selectedIds,
        action: bulkAction,
        reason: bulkAction === 'reject' ? reason : undefined,
      });
      const { succeeded, failed } = res.data;
      if (failed > 0) toast.warning(`${succeeded} updated, ${failed} could not be found`);
      else toast.success(`${succeeded} vendor${succeeded === 1 ? '' : 's'} updated`);

      await fetchVendors();
      setSelectedIds([]);
      setBulkAction(null);
      setReason('');
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      toast.error(error?.response?.data?.error || 'Bulk action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ok = exportToCsv(`vendorhub-vendors-${pill.toLowerCase()}`, filtered, [
      { header: 'Name', value: (v) => v.displayName },
      { header: 'Slug', value: (v) => v.slug },
      { header: 'Email', value: (v) => v.email },
      { header: 'Phone', value: (v) => v.phone || v.mobile || '' },
      { header: 'Type', value: (v) => v.vendorType ?? '' },
      { header: 'City', value: (v) => v.city ?? '' },
      { header: 'Status', value: (v) => v.status },
      { header: 'Plan', value: (v) => v.subscriptionPlan ?? '' },
      { header: 'Rating', value: (v) => v.rating ?? '' },
      { header: 'Reviews', value: (v) => v.reviewCount ?? '' },
      { header: 'Joined', value: (v) => formatDate(v.createdAt) },
    ]);
    if (ok) toast.success(`Exported ${filtered.length} vendor${filtered.length === 1 ? '' : 's'}`);
    else toast.error('Nothing to export — no vendors match the current filters');
  };

  const toggleQueueSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      sortValue: (v) => v.displayName?.toLowerCase() ?? '',
      cell: (v) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#8A7BA8]/14 text-[#5B4F73] flex items-center justify-center shrink-0 font-heading font-bold text-sm">
            {(v.displayName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#2C2621] truncate">{v.displayName}</p>
            <p className="text-xs text-[#9C8E82] truncate">{v.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (v) => v.vendorType ?? '',
      hideOnMobile: true,
      cell: (v) => (
        <div className="text-xs text-[#6B5E54]">
          <p>{v.vendorType || 'Unspecified'}</p>
          {v.city && <p className="text-[#9C8E82]">{v.city}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (v) => v.status,
      cell: (v) => <AdminStatusBadge status={v.status} />,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: (v) => v.rating ?? 0,
      hideOnMobile: true,
      cell: (v) =>
        v.rating ? (
          <span className="inline-flex items-center gap-1 text-sm text-[#2C2621]">
            <Star className="w-3.5 h-3.5 fill-[#C4975A] text-[#C4975A]" />
            {v.rating.toFixed(1)}
            <span className="text-xs text-[#9C8E82]">({v.reviewCount ?? 0})</span>
          </span>
        ) : (
          <span className="text-xs text-[#9C8E82]">No reviews</span>
        ),
    },
    {
      key: 'plan',
      header: 'Plan',
      sortValue: (v) => v.subscriptionPlan ?? '',
      hideOnMobile: true,
      // Reads the admin's own chosen colour per tier (set on the Plans page)
      // rather than a hardcoded "PREMIUM = gold" check, so a renamed or
      // recoloured tier is reflected here automatically.
      cell: (v) => <AdminPlanBadge planCode={v.subscriptionPlan} plans={plans} />,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(v); }} aria-label={`View ${v.displayName}`}>
            <Eye className="w-4 h-4" />
          </Button>
          {v.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(v); setAction('approve'); }}>
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
              <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelected(v); setAction('reject'); setReason(''); }}>
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {v.status === 'ACTIVE' && (
            <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelected(v); setAction('suspend'); setReason(''); }}>
              <PauseCircle className="w-4 h-4" />
              Suspend
            </Button>
          )}
          {(v.status === 'SUSPENDED' || v.status === 'REJECTED') && (
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(v); setAction('reinstate'); }}>
              <Undo2 className="w-4 h-4" />
              Reinstate
            </Button>
          )}
        </div>
      ),
    },
  ];

  const actionCopy: Record<string, { title: string; description: string; confirm: string; destructive: boolean }> = {
    approve: {
      title: `Approve ${selected?.displayName}?`,
      description: 'Their storefront goes live on VendorHub and they are notified.',
      confirm: 'Approve', destructive: false,
    },
    reject: {
      title: `Reject ${selected?.displayName}?`,
      description: 'The reason below is saved on their record and sent to them.',
      confirm: 'Reject', destructive: true,
    },
    suspend: {
      title: `Suspend ${selected?.displayName}?`,
      description: 'Their storefront is taken offline immediately. A reason is optional but is sent if given.',
      confirm: 'Suspend', destructive: true,
    },
    reinstate: {
      title: `Reinstate ${selected?.displayName}?`,
      description: 'Their account returns to active and they are notified.',
      confirm: 'Reinstate', destructive: false,
    },
  };

  const copy = action ? actionCopy[action] : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vendors"
        description="Approvals, lifecycle and vendor quality"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Total Vendors" value={counts.all} icon={Building2} tone="accent" />
        <AdminStatCard
          label="Pending Approval"
          value={counts.PENDING}
          icon={Clock}
          tone={counts.PENDING ? 'warning' : 'neutral'}
        />
        <AdminStatCard label="Active" value={counts.ACTIVE} icon={CheckCircle2} tone="success" />
        <AdminStatCard
          label="Suspended / Rejected"
          value={counts.SUSPENDED + counts.REJECTED}
          icon={PauseCircle}
          tone={counts.SUSPENDED + counts.REJECTED ? 'danger' : 'neutral'}
        />
      </div>

      {/* Approval queue — the reason this page exists */}
      <AdminSectionCard
        title="Approval Queue"
        icon={Clock}
        contentClassName="p-0"
        action={
          selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="font-body text-xs text-[#6B5E54]">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => setBulkAction('approve')}>
                <CheckCircle2 className="w-4 h-4" />
                Approve all
              </Button>
              <Button size="sm" variant="ghost" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
                onClick={() => { setBulkAction('reject'); setReason(''); }}>
                <XCircle className="w-4 h-4" />
                Reject all
              </Button>
            </div>
          ) : (
            <Badge variant={pendingQueue.length ? 'warning' : 'success'}>{pendingQueue.length}</Badge>
          )
        }
      >
        {pendingQueue.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#5B8C5A]/50 mx-auto mb-2" />
            <p className="font-body text-sm text-[#6B5E54]">No vendors awaiting approval.</p>
            {autoApprove === true && (
              // Without this note an empty queue looks broken rather than
              // configured — new vendors are going straight to ACTIVE.
              <p className="mt-2 font-body text-xs text-[#9C8E82] max-w-lg mx-auto">
                Auto-approval is <strong>on</strong>, so new vendor signups become active immediately and never
                reach this queue. Turn it off in Settings to review each signup manually.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#CDC0B0]/40">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#FDFBF7]">
              <input
                type="checkbox"
                id="select-all-pending"
                checked={selectedIds.length === pendingQueue.length && pendingQueue.length > 0}
                onChange={(e) => setSelectedIds(e.target.checked ? pendingQueue.map((v) => v.id) : [])}
                className="w-4 h-4 accent-[#2C2621] cursor-pointer"
              />
              <Label htmlFor="select-all-pending" className="text-xs text-[#6B5E54] cursor-pointer">
                Select all {pendingQueue.length}
              </Label>
            </div>
            {pendingQueue.map((vendor) => (
              <div key={vendor.id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#FDFBF7] transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(vendor.id)}
                  onChange={() => toggleQueueSelection(vendor.id)}
                  aria-label={`Select ${vendor.displayName}`}
                  className="w-4 h-4 mt-1 accent-[#2C2621] cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm text-[#2C2621] truncate">{vendor.displayName}</p>
                  <p className="font-body text-xs text-[#6B5E54] truncate">
                    {vendor.email}
                    {vendor.vendorType ? ` · ${vendor.vendorType}` : ''}
                    {vendor.city ? ` · ${vendor.city}` : ''}
                  </p>
                  <p className="font-body text-xs text-[#9C8E82] mt-0.5">
                    Registered {formatDate(vendor.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openDetail(vendor)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelected(vendor); setAction('approve'); }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
                    onClick={() => { setSelected(vendor); setAction('reject'); setReason(''); }}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>

      {/* Full directory */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, city, type or slug…"
        pills={pills}
        activePill={pill}
        onPillChange={(value) => setPill(value)}
      >
        {vendorTypes.length > 0 && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {vendorTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {plans.length > 0 && (
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-40 h-11">
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
        rowKey={(v) => v.id}
        isLoading={isLoading}
        onRowClick={openDetail}
        pageSize={15}
        emptyTitle="No vendors match these filters"
        emptyDescription="Try a different status or clear the search."
      />

      {/* Single-vendor confirmation */}
      {copy && (
        <AdminConfirmDialog
          open={action !== null}
          onOpenChange={(open) => { if (!open) { setAction(null); setReason(''); } }}
          title={copy.title}
          description={copy.description}
          confirmLabel={copy.confirm}
          destructive={copy.destructive}
          isSubmitting={isSubmitting}
          disabled={action === 'reject' && !reason.trim()}
          onConfirm={runAction}
        >
          {(action === 'reject' || action === 'suspend') && (
            <div>
              <Label htmlFor="vendor-reason" className="mb-2">
                Reason {action === 'reject' ? '*' : '(optional)'}
              </Label>
              <Textarea
                id="vendor-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the decision — the vendor sees this"
                className="min-h-24"
              />
            </div>
          )}
        </AdminConfirmDialog>
      )}

      {/* Bulk confirmation */}
      <AdminConfirmDialog
        open={bulkAction !== null}
        onOpenChange={(open) => { if (!open) { setBulkAction(null); setReason(''); } }}
        title={
          bulkAction === 'approve'
            ? `Approve ${selectedIds.length} vendor${selectedIds.length === 1 ? '' : 's'}?`
            : `Reject ${selectedIds.length} vendor${selectedIds.length === 1 ? '' : 's'}?`
        }
        description={
          bulkAction === 'approve'
            ? 'Each storefront goes live and every vendor is notified.'
            : 'The same reason is saved on each record and sent to every vendor selected.'
        }
        confirmLabel={bulkAction === 'approve' ? 'Approve all' : 'Reject all'}
        destructive={bulkAction === 'reject'}
        isSubmitting={isSubmitting}
        disabled={bulkAction === 'reject' && !reason.trim()}
        onConfirm={runBulk}
      >
        {bulkAction === 'reject' && (
          <div>
            <Label htmlFor="bulk-reason" className="mb-2">Reason *</Label>
            <Textarea
              id="bulk-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sent to every vendor in this batch"
              className="min-h-24"
            />
          </div>
        )}
      </AdminConfirmDialog>

      {/* Vendor detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selected?.displayName ?? 'Vendor'}
              {selected && <AdminStatusBadge status={selected.status} />}
            </DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#C4975A]" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Fact icon={Mail} label="Email" value={detail.profile.email} />
                <Fact icon={Phone} label="Phone" value={detail.profile.phone || detail.profile.mobile} />
                <Fact icon={Building2} label="Type" value={detail.profile.vendorType} />
                <Fact icon={MapPin} label="Location" value={[detail.profile.city, detail.profile.state].filter(Boolean).join(', ')} />
                <Fact icon={Calendar} label="Registered" value={formatDate(detail.profile.createdAt)} />
                <Fact
                  icon={Star}
                  label="Subscription"
                  value={detail.stats?.subscription
                    ? `${detail.stats.subscription.plan} · ${detail.stats.subscription.status}`
                    : detail.profile.subscriptionPlan || 'Basic'}
                />
              </div>

              {detail.profile.slug && (
                <Link
                  href={`/vendors/${detail.profile.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm text-[#C4975A] hover:underline"
                >
                  View public storefront
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {detail.profile.rejectionReason && (
                <div className="rounded-xl border border-[#B85C5C]/30 bg-[#B85C5C]/8 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8E4343] mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Reason on file
                  </p>
                  <p className="text-sm text-[#6B5E54] break-words">{detail.profile.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat icon={FileText} label="Quotes" value={detail.stats?.totalQuotes ?? 0} />
                <MiniStat icon={CheckCircle2} label="Completed" value={detail.stats?.completedQuotes ?? 0} />
                <MiniStat icon={Package} label="Catalogues" value={detail.stats?.catalogues ?? 0} />
                <MiniStat icon={MessageSquare} label="Chats" value={detail.stats?.conversations ?? 0} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-[#6B5E54]">
                {detail.stats?.averageRating != null && (
                  <span>
                    Rating: <strong className="text-[#2C2621]">{detail.stats.averageRating}★</strong>{' '}
                    ({detail.stats.totalReviews} review{detail.stats.totalReviews === 1 ? '' : 's'})
                  </span>
                )}
                {detail.stats?.completionRate != null && (
                  <span>
                    Completion rate: <strong className="text-[#2C2621]">{detail.stats.completionRate}%</strong>
                  </span>
                )}
                {!!detail.stats?.flaggedReviews && (
                  <span className="text-[#B85C5C]">{detail.stats.flaggedReviews} flagged review(s)</span>
                )}
              </div>

              <div>
                <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-2">Recent quotes</h4>
                {detail.quotes?.length ? (
                  <div className="space-y-2">
                    {detail.quotes.map((q: any) => (
                      <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#CDC0B0]/50 p-3">
                        <div className="min-w-0">
                          <p className="text-sm text-[#2C2621] break-words">{q.service || 'Untitled request'}</p>
                          <p className="text-xs text-[#9C8E82]">{q.customerName} · {formatDate(q.createdAt)}</p>
                        </div>
                        <AdminStatusBadge status={q.status} className="shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9C8E82]">No quotes yet.</p>
                )}
              </div>

              <div>
                <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-2">Recent reviews</h4>
                {detail.reviews?.length ? (
                  <div className="space-y-2">
                    {detail.reviews.map((r: any) => (
                      <div key={r.id} className="rounded-xl border border-[#CDC0B0]/50 p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-[#C4975A]">{r.rating}★</span>
                          <span className="text-xs text-[#9C8E82]">{r.customerName} · {formatDate(r.createdAt)}</span>
                          {r.flagged && <Badge variant="destructive">Flagged</Badge>}
                        </div>
                        <p className="text-sm text-[#6B5E54] break-words">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9C8E82]">No reviews yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#9C8E82] py-6">Could not load vendor details.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-[#9C8E82] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[#9C8E82]">{label}</p>
        <p className="text-sm text-[#2C2621] break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-3 text-center">
      <Icon className="w-4 h-4 text-[#9C8E82] mx-auto mb-1" />
      <p className="font-heading font-bold text-lg text-[#2C2621] tabular-nums">{value}</p>
      <p className="text-xs text-[#9C8E82]">{label}</p>
    </div>
  );
}
