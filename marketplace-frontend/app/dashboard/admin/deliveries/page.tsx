'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Loader2,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Timer,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  ExternalLink,
  Eye,
  MessageSquare,
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
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminFilterBar,
  AdminDataTable,
  AdminStatusBadge,
  AdminSectionCard,
  AdminConfirmDialog,
  AdminEmptyState,
  exportToCsv,
  type Column,
  type FilterPill,
} from '@/components/admin';

interface AdminQuote {
  id: string;
  vendorSlug: string;
  vendorName: string;
  customerName?: string;
  customerEmail: string;
  customerMobile?: string;
  serviceRequested: string;
  projectDescription: string;
  budget?: number;
  preferredDate?: string;
  status: string;
  vendorResponse?: string;
  estimatedCost?: number;
  estimatedTime?: string;
  deliveredAt?: string;
  completedAt?: string;
  disputeReason?: string;
  disputedAt?: string;
  createdAt: string;
  updatedAt?: string;
  autoCompleteAt?: string;
  conversationId?: string;
}

interface QuoteStats {
  total: number;
  byStatus: Record<string, number>;
  avgHoursToDelivery: number | null;
  avgHoursToCompletion: number | null;
  nearingAutoComplete: number;
  autoCompleteDays: number;
}

/** Every status a quote can actually reach — IN_PROGRESS/CLOSED are declared in the model but no code path ever sets them. */
type StatusPill = 'all' | 'NEW' | 'QUOTED' | 'ACCEPTED' | 'DELIVERED' | 'DISPUTED' | 'COMPLETED' | 'REJECTED';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatHours(hours: number | null) {
  if (hours === null || hours === undefined) return null;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

/** Countdown text + urgency tone for a DELIVERED quote's auto-complete deadline. */
function autoCompleteCountdown(autoCompleteAt?: string) {
  if (!autoCompleteAt) return null;
  const target = new Date(autoCompleteAt).getTime();
  if (Number.isNaN(target)) return null;

  const remainingMs = target - Date.now();
  if (remainingMs <= 0) return { text: 'Auto-completing shortly', tone: 'danger' as const };

  const hours = remainingMs / 3600000;
  if (hours < 24) return { text: `${Math.max(1, Math.round(hours))}h left`, tone: 'danger' as const };

  const days = Math.floor(hours / 24);
  return { text: `${days}d left`, tone: days <= 2 ? ('warning' as const) : ('neutral' as const) };
}

function DeliveriesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  // Pre-selects the Disputed pill when arriving from the old /admin/disputes
  // link (now a redirect) or any other deep link carrying ?status=.
  const initialStatus = searchParams.get('status');
  const [pill, setPill] = useState<StatusPill>(
    (['NEW', 'QUOTED', 'ACCEPTED', 'DELIVERED', 'DISPUTED', 'COMPLETED', 'REJECTED'].includes(initialStatus ?? '')
      ? (initialStatus as StatusPill)
      : 'all')
  );
  const [vendorFilter, setVendorFilter] = useState('all');

  const [selected, setSelected] = useState<AdminQuote | null>(null);
  const [dialog, setDialog] = useState<'view' | 'complete' | 'reopen' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [quotesRes, statsRes] = await Promise.all([
        apiClient.get('/admin/quotes'),
        apiClient.get('/admin/quotes/stats'),
      ]);
      setQuotes(quotesRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: quotes.length };
    for (const q of quotes) c[q.status] = (c[q.status] ?? 0) + 1;
    return c;
  }, [quotes]);

  const vendors = useMemo(() => [...new Set(quotes.map((q) => q.vendorName))].sort(), [quotes]);

  const awaitingConfirmation = useMemo(
    () => quotes.filter((q) => q.status === 'DELIVERED').sort((a, b) =>
      new Date(a.autoCompleteAt ?? 0).getTime() - new Date(b.autoCompleteAt ?? 0).getTime()
    ),
    [quotes]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return quotes.filter((q) => {
      if (pill !== 'all' && q.status !== pill) return false;
      if (vendorFilter !== 'all' && q.vendorName !== vendorFilter) return false;
      if (!query) return true;
      return [q.serviceRequested, q.customerName, q.customerEmail, q.vendorName, q.projectDescription]
        .some((f) => f?.toLowerCase().includes(query));
    });
  }, [quotes, pill, vendorFilter, search]);

  const pills: FilterPill<StatusPill>[] = [
    { value: 'all', label: 'All', count: counts.all ?? 0 },
    { value: 'NEW', label: 'New', count: counts.NEW ?? 0 },
    { value: 'QUOTED', label: 'Quoted', count: counts.QUOTED ?? 0 },
    { value: 'ACCEPTED', label: 'Accepted', count: counts.ACCEPTED ?? 0 },
    { value: 'DELIVERED', label: 'Delivered', count: counts.DELIVERED ?? 0, tone: 'warning' },
    { value: 'DISPUTED', label: 'Disputed', count: counts.DISPUTED ?? 0, tone: 'danger' },
    { value: 'COMPLETED', label: 'Completed', count: counts.COMPLETED ?? 0 },
    { value: 'REJECTED', label: 'Rejected', count: counts.REJECTED ?? 0, tone: 'danger' },
  ];

  const openDetail = (quote: AdminQuote) => {
    setSelected(quote);
    setDialog('view');
  };

  const resolveDispute = async (resolution: 'COMPLETE' | 'REOPEN') => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/quotes/${selected.id}/resolve-dispute`, { resolution });
      toast.success(
        resolution === 'COMPLETE'
          ? 'Resolved — marked as completed'
          : 'Reopened — vendor will need to redeliver'
      );
      await fetchData();
      setDialog(null);
      setSelected(null);
    } catch (error: any) {
      console.error('Failed to resolve dispute:', error);
      toast.error(error?.response?.data?.error || 'Failed to resolve dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ok = exportToCsv(`vendorhub-quotes-${pill.toLowerCase()}`, filtered, [
      { header: 'Service', value: (q) => q.serviceRequested },
      { header: 'Customer', value: (q) => q.customerName ?? '' },
      { header: 'Customer email', value: (q) => q.customerEmail },
      { header: 'Vendor', value: (q) => q.vendorName },
      { header: 'Status', value: (q) => q.status },
      { header: 'Budget', value: (q) => q.budget ?? '' },
      { header: 'Estimated cost', value: (q) => q.estimatedCost ?? '' },
      { header: 'Created', value: (q) => formatDate(q.createdAt) },
      { header: 'Delivered', value: (q) => formatDate(q.deliveredAt) },
      { header: 'Completed', value: (q) => formatDate(q.completedAt) },
      { header: 'Dispute reason', value: (q) => q.disputeReason ?? '' },
    ]);
    if (ok) toast.success(`Exported ${filtered.length} quote${filtered.length === 1 ? '' : 's'}`);
    else toast.error('Nothing to export — no quotes match the current filters');
  };

  const columns: Column<AdminQuote>[] = [
    {
      key: 'service',
      header: 'Service',
      sortValue: (q) => q.serviceRequested?.toLowerCase() ?? '',
      cell: (q) => (
        <div className="min-w-0">
          <p className="font-medium text-[#2C2621] truncate max-w-xs">{q.serviceRequested}</p>
          <p className="text-xs text-[#9C8E82] truncate">{q.customerName || q.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      sortValue: (q) => q.vendorName?.toLowerCase() ?? '',
      hideOnMobile: true,
      cell: (q) => <span className="text-sm text-[#6B5E54]">{q.vendorName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (q) => q.status,
      cell: (q) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <AdminStatusBadge status={q.status} />
          {q.status === 'DELIVERED' && (() => {
            const countdown = autoCompleteCountdown(q.autoCompleteAt);
            if (!countdown) return null;
            return (
              <Badge
                variant="outline"
                className={
                  countdown.tone === 'danger'
                    ? 'text-[#B85C5C] border-[#B85C5C]/30'
                    : countdown.tone === 'warning'
                      ? 'text-[#C4975A] border-[#C4975A]/30'
                      : 'text-[#9C8E82]'
                }
              >
                <Timer className="w-3 h-3" />
                {countdown.text}
              </Badge>
            );
          })()}
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      sortValue: (q) => q.budget ?? 0,
      hideOnMobile: true,
      cell: (q) => (
        <span className="text-sm text-[#6B5E54] tabular-nums">
          {q.estimatedCost ? `$${q.estimatedCost.toLocaleString()}` : q.budget ? `~$${q.budget.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      sortValue: (q) => new Date(q.createdAt).getTime() || 0,
      hideOnMobile: true,
      cell: (q) => <span className="text-xs text-[#6B5E54]">{formatDate(q.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (q) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(q); }} aria-label="View quote">
            <Eye className="w-4 h-4" />
          </Button>
          {q.status === 'DISPUTED' && (
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(q); setDialog('complete'); }}>
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Deliveries"
        description="Every quote's lifecycle, from request to completion — and disputes that need a decision"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Total Quotes" value={stats?.total} icon={FileText} tone="accent" />
        <AdminStatCard
          label="Awaiting Confirmation"
          value={counts.DELIVERED ?? 0}
          icon={Truck}
          tone={counts.DELIVERED ? 'warning' : 'neutral'}
          hint={stats?.nearingAutoComplete ? `${stats.nearingAutoComplete} within 24h of auto-complete` : undefined}
        />
        <AdminStatCard
          label="Open Disputes"
          value={counts.DISPUTED ?? 0}
          icon={AlertTriangle}
          tone={counts.DISPUTED ? 'danger' : 'neutral'}
        />
        <AdminStatCard
          label="Avg. Time to Deliver"
          value={formatHours(stats?.avgHoursToDelivery ?? null) ?? '—'}
          icon={Clock}
          tone="neutral"
          hint={
            formatHours(stats?.avgHoursToCompletion ?? null)
              ? `${formatHours(stats!.avgHoursToCompletion)} avg. to full completion`
              : undefined
          }
        />
      </div>

      {/* Awaiting confirmation — deliveries racing the 7-day auto-complete clock */}
      <AdminSectionCard
        title="Awaiting Confirmation"
        icon={Truck}
        contentClassName="p-0"
        action={<Badge variant={awaitingConfirmation.length ? 'warning' : 'success'}>{awaitingConfirmation.length}</Badge>}
      >
        {awaitingConfirmation.length === 0 ? (
          <AdminEmptyState
            icon={CheckCircle2}
            title="Nothing waiting on a customer"
            description="Every delivered job has either been confirmed or is still within its window."
          />
        ) : (
          <div className="divide-y divide-[#CDC0B0]/40">
            {awaitingConfirmation.map((q) => {
              const countdown = autoCompleteCountdown(q.autoCompleteAt);
              return (
                <div key={q.id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#FDFBF7] transition-colors cursor-pointer"
                  onClick={() => openDetail(q)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm text-[#2C2621] truncate">{q.serviceRequested}</p>
                    <p className="font-body text-xs text-[#6B5E54] truncate">
                      {q.customerName || q.customerEmail} · {q.vendorName}
                    </p>
                    <p className="font-body text-xs text-[#9C8E82] mt-0.5">
                      Delivered {formatDate(q.deliveredAt)} · auto-completes {formatDate(q.autoCompleteAt)}
                    </p>
                  </div>
                  {countdown && (
                    <Badge
                      variant="outline"
                      className={
                        countdown.tone === 'danger'
                          ? 'text-[#B85C5C] border-[#B85C5C]/30 shrink-0'
                          : countdown.tone === 'warning'
                            ? 'text-[#C4975A] border-[#C4975A]/30 shrink-0'
                            : 'text-[#9C8E82] shrink-0'
                      }
                    >
                      <Timer className="w-3 h-3" />
                      {countdown.text}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AdminSectionCard>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by service, customer or vendor…"
        pills={pills}
        activePill={pill}
        onPillChange={(value) => setPill(value)}
      >
        {vendors.length > 0 && (
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue placeholder="All vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        columns={columns}
        rowKey={(q) => q.id}
        onRowClick={openDetail}
        pageSize={15}
        emptyTitle="No quotes match these filters"
        emptyDescription="Try a different status or clear the search."
      />

      {/* Quote detail */}
      <Dialog open={dialog === 'view'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selected?.serviceRequested}
              {selected && <AdminStatusBadge status={selected.status} />}
            </DialogTitle>
            <DialogDescription>
              {selected?.customerName || selected?.customerEmail} → {selected?.vendorName}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-3">
                <p className="text-sm text-[#2C2621] whitespace-pre-line break-words">{selected.projectDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Fact icon={Mail} label="Customer email" value={selected.customerEmail} />
                {selected.customerMobile && <Fact icon={Phone} label="Customer phone" value={selected.customerMobile} />}
                <Fact icon={Building2} label="Vendor" value={selected.vendorName} />
                <Fact icon={DollarSign} label="Budget" value={selected.budget ? `$${selected.budget.toLocaleString()}` : undefined} />
                {selected.preferredDate && (
                  <Fact icon={Calendar} label="Preferred date" value={formatDate(selected.preferredDate)} />
                )}
                {selected.estimatedCost && (
                  <Fact icon={DollarSign} label="Vendor estimate" value={`$${selected.estimatedCost.toLocaleString()}${selected.estimatedTime ? ` · ${selected.estimatedTime}` : ''}`} />
                )}
              </div>

              {selected.vendorResponse && (
                <div>
                  <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-1.5">Vendor's response</h4>
                  <p className="text-sm text-[#6B5E54] whitespace-pre-line break-words rounded-xl border border-[#CDC0B0]/50 p-3">
                    {selected.vendorResponse}
                  </p>
                </div>
              )}

              {/* Lifecycle timeline */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-2">Timeline</h4>
                <div className="space-y-2">
                  <TimelineRow label="Requested" value={formatDateTime(selected.createdAt)} done />
                  {selected.deliveredAt && <TimelineRow label="Delivered" value={formatDateTime(selected.deliveredAt)} done />}
                  {selected.disputedAt && <TimelineRow label="Disputed" value={formatDateTime(selected.disputedAt)} tone="danger" done />}
                  {selected.completedAt && <TimelineRow label="Completed" value={formatDateTime(selected.completedAt)} tone="success" done />}
                  {selected.status === 'DELIVERED' && selected.autoCompleteAt && (
                    <TimelineRow label="Auto-completes" value={formatDateTime(selected.autoCompleteAt)} tone="warning" />
                  )}
                </div>
              </div>

              {selected.disputeReason && (
                <div className="rounded-xl border border-[#B85C5C]/30 bg-[#B85C5C]/8 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8E4343] mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    What the customer reported
                  </p>
                  <p className="text-sm text-[#6B5E54] break-words">{selected.disputeReason}</p>
                </div>
              )}

              {selected.conversationId && (
                <p className="flex items-center gap-1.5 text-xs text-[#9C8E82]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  This quote has an active conversation between the customer and vendor.
                </p>
              )}

              <Link
                href={`/vendors/${selected.vendorSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-[#C4975A] hover:underline"
              >
                View vendor storefront
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {selected.status === 'DISPUTED' && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDialog('complete')}>
                    <CheckCircle2 className="w-4 h-4" />
                    Side with vendor & complete
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setDialog('reopen')}>
                    <RotateCcw className="w-4 h-4" />
                    Reopen for vendor
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve dispute: complete */}
      <AdminConfirmDialog
        open={dialog === 'complete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Side with vendor & complete?"
        description="The quote is marked Completed, as if the customer had confirmed it themselves — this makes it eligible for a review. Both parties are notified."
        confirmLabel="Mark completed"
        isSubmitting={isSubmitting}
        onConfirm={() => resolveDispute('COMPLETE')}
      />

      {/* Resolve dispute: reopen */}
      <AdminConfirmDialog
        open={dialog === 'reopen'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Reopen for vendor?"
        description="The quote goes back to Accepted so the vendor can address the issue and redeliver. Both parties are notified."
        confirmLabel="Reopen"
        destructive
        isSubmitting={isSubmitting}
        onConfirm={() => resolveDispute('REOPEN')}
      />
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-[#9C8E82] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[#9C8E82]">{label}</p>
        <p className="text-sm text-[#2C2621] break-words">{value}</p>
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  value,
  tone = 'neutral',
  done = false,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
  done?: boolean;
}) {
  const dotColor = {
    neutral: 'bg-[#9C8E82]',
    success: 'bg-[#5B8C5A]',
    danger: 'bg-[#B85C5C]',
    warning: 'bg-[#C4975A]',
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${done ? dotColor : 'bg-[#CDC0B0] border border-dashed border-[#9C8E82]'}`} />
      <span className="text-sm text-[#6B5E54] flex-1">{label}</span>
      <span className="text-xs text-[#9C8E82] tabular-nums">{value}</span>
    </div>
  );
}

export default function DeliveriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
        </div>
      }
    >
      <DeliveriesContent />
    </Suspense>
  );
}
