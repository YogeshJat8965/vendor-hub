'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Star,
  Loader2,
  Download,
  Flag,
  ShieldCheck,
  ExternalLink,
  Mail,
  Calendar,
  FileText,
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
  AdminDataTable,
  AdminStatusBadge,
  AdminConfirmDialog,
  exportToCsv,
  type Column,
  type FilterPill,
} from '@/components/admin';

// Matches the categories a vendor can pick when flagging a review
// (components/dialogs/FlagReviewDialog.tsx) and the backend's Review.flagReason.
type FlagReason = 'FAKE' | 'OFFENSIVE' | 'SPAM' | 'COMPETITOR' | 'OTHER';

const REASON_LABELS: Record<FlagReason, string> = {
  FAKE: 'Fake / not a real customer',
  OFFENSIVE: 'Offensive language',
  SPAM: 'Spam / irrelevant',
  COMPETITOR: 'Suspected competitor',
  OTHER: 'Other',
};

interface AdminReview {
  id: string;
  vendorSlug: string;
  vendorName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  flagged: boolean;
  flagReason?: FlagReason;
  flagDetails?: string;
  flaggedAt?: string;
  createdAt: string;
  quoteRequestId?: string;
  linkedQuote?: { id: string; service: string; status: string } | null;
}

type PillValue = 'all' | 'flagged' | 'low';
type DateRange = 'all' | '7' | '30' | '90';

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'fill-[#C4975A] text-[#C4975A]' : 'text-[#CDC0B0]'}`}
        />
      ))}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ModerateReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [pill, setPill] = useState<PillValue>('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [dialog, setDialog] = useState<'view' | 'dismiss' | 'delete' | null>(null);
  const [reason, setReason] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/reviews');
      setReviews(res.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchReviews();
  }, [user, fetchReviews]);

  const counts = useMemo(() => ({
    all: reviews.length,
    flagged: reviews.filter((r) => r.flagged).length,
    low: reviews.filter((r) => r.rating <= 2).length,
  }), [reviews]);

  const vendors = useMemo(
    () => [...new Set(reviews.map((r) => r.vendorName))].sort(),
    [reviews]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cutoff = dateRange === 'all' ? null : Date.now() - Number(dateRange) * 86400000;

    return reviews.filter((r) => {
      if (pill === 'flagged' && !r.flagged) return false;
      if (pill === 'low' && r.rating > 2) return false;
      if (vendorFilter !== 'all' && r.vendorName !== vendorFilter) return false;
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
      if (verifiedOnly && !r.verifiedPurchase) return false;
      if (cutoff !== null) {
        const created = new Date(r.createdAt).getTime();
        if (Number.isNaN(created) || created < cutoff) return false;
      }
      if (!query) return true;
      return [r.customerName, r.customerEmail, r.vendorName, r.comment]
        .some((f) => f?.toLowerCase().includes(query));
    });
  }, [reviews, pill, vendorFilter, ratingFilter, dateRange, verifiedOnly, search]);

  const pills: FilterPill<PillValue>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'flagged', label: 'Flagged', count: counts.flagged, tone: 'danger' },
    { value: 'low', label: 'Low rated (≤2★)', count: counts.low, tone: 'warning' },
  ];

  const openDetail = (review: AdminReview) => {
    setSelected(review);
    setDialog('view');
  };

  const runDismiss = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/reviews/${selected.id}/unflag`);
      toast.success('Flag dismissed — the review counts toward the vendor’s rating again');
      await fetchReviews();
      setDialog(null);
      setSelected(null);
    } catch (error) {
      console.error('Failed to dismiss flag:', error);
      toast.error('Failed to dismiss the flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runDelete = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/reviews/${selected.id}`, { data: { reason } });
      toast.success('Review deleted permanently');
      await fetchReviews();
      setDialog(null);
      setSelected(null);
      setReason('');
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ok = exportToCsv(`vendorhub-reviews-${pill}`, filtered, [
      { header: 'Customer', value: (r) => r.customerName },
      { header: 'Email', value: (r) => r.customerEmail },
      { header: 'Vendor', value: (r) => r.vendorName },
      { header: 'Rating', value: (r) => r.rating },
      { header: 'Comment', value: (r) => r.comment },
      { header: 'Verified purchase', value: (r) => (r.verifiedPurchase ? 'Yes' : 'No') },
      { header: 'Flagged', value: (r) => (r.flagged ? 'Yes' : 'No') },
      { header: 'Flag reason', value: (r) => (r.flagReason ? REASON_LABELS[r.flagReason] : '') },
      { header: 'Flag details', value: (r) => r.flagDetails ?? '' },
      { header: 'Posted', value: (r) => formatDate(r.createdAt) },
    ]);
    if (ok) toast.success(`Exported ${filtered.length} review${filtered.length === 1 ? '' : 's'}`);
    else toast.error('Nothing to export — no reviews match the current filters');
  };

  const columns: Column<AdminReview>[] = [
    {
      key: 'reviewer',
      header: 'Reviewer',
      sortValue: (r) => r.customerName?.toLowerCase() ?? '',
      cell: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#6B8CAE]/14 text-[#3F5A75] flex items-center justify-center shrink-0 font-heading font-bold text-sm">
            {(r.customerName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#2C2621] truncate">{r.customerName}</p>
            <p className="text-xs text-[#9C8E82] truncate">{r.vendorName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: (r) => r.rating,
      cell: (r) => renderStars(r.rating),
    },
    {
      key: 'comment',
      header: 'Comment',
      hideOnMobile: true,
      cell: (r) => (
        <p className="text-sm text-[#6B5E54] line-clamp-2 max-w-sm">{r.comment}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      cell: (r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {r.flagged ? (
            <Badge variant="destructive">
              <Flag className="w-3 h-3" />
              {r.flagReason ? REASON_LABELS[r.flagReason] : 'Flagged'}
            </Badge>
          ) : (
            <Badge variant="success">Clean</Badge>
          )}
          {r.verifiedPurchase && (
            <Badge variant="outline" className="text-[#5B8C5A] border-[#5B8C5A]/30">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'posted',
      header: 'Posted',
      sortValue: (r) => new Date(r.createdAt).getTime() || 0,
      hideOnMobile: true,
      cell: (r) => <span className="text-xs text-[#6B5E54]">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(r); }} aria-label="View review">
            <Eye className="w-4 h-4" />
          </Button>
          {r.flagged && (
            <Button variant="ghost" size="sm" className="text-[#5B8C5A] hover:bg-[#5B8C5A] hover:text-white"
              onClick={(e) => { e.stopPropagation(); setSelected(r); setDialog('dismiss'); }}>
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
            onClick={(e) => { e.stopPropagation(); setSelected(r); setDialog('delete'); setReason(''); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        description="Every review on the platform — flagged, low-rated, or clean"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Total Reviews" value={counts.all} icon={Star} tone="accent" />
        <AdminStatCard
          label="Flagged"
          value={counts.flagged}
          icon={Flag}
          tone={counts.flagged ? 'danger' : 'neutral'}
        />
        <AdminStatCard
          label="Low Rated (≤2★)"
          value={counts.low}
          icon={AlertTriangle}
          tone={counts.low ? 'warning' : 'neutral'}
        />
        <AdminStatCard
          label="Verified Purchases"
          value={reviews.filter((r) => r.verifiedPurchase).length}
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer, vendor or comment…"
        pills={pills}
        activePill={pill}
        onPillChange={(value) => setPill(value)}
      >
        {vendors.length > 0 && (
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-44 h-11">
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
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-36 h-11">
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} star{n === 1 ? '' : 's'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-36 h-11">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={verifiedOnly ? 'default' : 'outline'}
          size="sm"
          className="h-11"
          onClick={() => setVerifiedOnly((v) => !v)}
        >
          <ShieldCheck className="w-4 h-4" />
          Verified only
        </Button>
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        onRowClick={openDetail}
        pageSize={15}
        emptyTitle="No reviews match these filters"
        emptyDescription="Try a different tab or clear the search."
      />

      {/* Detail */}
      <Dialog open={dialog === 'view'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selected?.customerName}
              {selected?.flagged && <Badge variant="destructive">Flagged</Badge>}
              {selected?.verifiedPurchase && (
                <Badge variant="outline" className="text-[#5B8C5A] border-[#5B8C5A]/30">Verified</Badge>
              )}
            </DialogTitle>
            <DialogDescription>Review for {selected?.vendorName}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderStars(selected.rating)}
                <span className="text-xs text-[#9C8E82]">{formatDate(selected.createdAt)}</span>
              </div>

              <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-3">
                <p className="text-sm text-[#2C2621] whitespace-pre-line break-words">{selected.comment}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#9C8E82] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#9C8E82]">Customer email</p>
                    <p className="text-sm text-[#2C2621] break-words">{selected.customerEmail}</p>
                  </div>
                </div>
                {selected.linkedQuote && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[#9C8E82] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#9C8E82]">Linked quote</p>
                      <p className="text-sm text-[#2C2621] break-words">
                        {selected.linkedQuote.service}{' '}
                        <AdminStatusBadge status={selected.linkedQuote.status} className="ml-1" />
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selected.flagged && (
                <div className="rounded-xl border border-[#B85C5C]/30 bg-[#B85C5C]/8 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8E4343] mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Flagged by {selected.vendorName}
                    {selected.flaggedAt ? ` on ${formatDate(selected.flaggedAt)}` : ''}
                  </p>
                  <p className="text-sm text-[#6B5E54]">
                    {selected.flagReason ? REASON_LABELS[selected.flagReason] : 'No reason given'}
                  </p>
                  {selected.flagDetails && (
                    <p className="text-sm text-[#6B5E54] mt-1 italic">&ldquo;{selected.flagDetails}&rdquo;</p>
                  )}
                </div>
              )}

              <Link
                href={`/vendors/${selected.vendorSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-[#C4975A] hover:underline"
              >
                View vendor storefront
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex gap-2 pt-2">
                {selected.flagged && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDialog('dismiss')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Dismiss flag
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white border-[#B85C5C]/30"
                  onClick={() => { setDialog('delete'); setReason(''); }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dismiss flag */}
      <AdminConfirmDialog
        open={dialog === 'dismiss'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Dismiss this flag?"
        description="The review is restored and counts toward the vendor's public rating again. The vendor who flagged it is notified."
        confirmLabel="Dismiss flag"
        isSubmitting={isSubmitting}
        onConfirm={runDismiss}
      />

      {/* Delete */}
      <AdminConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Delete this review?"
        description="This cannot be undone. The review is removed permanently and both the vendor and the customer are notified."
        confirmLabel="Delete permanently"
        destructive
        isSubmitting={isSubmitting}
        onConfirm={runDelete}
      >
        <div>
          <Label htmlFor="delete-reason" className="mb-2">Reason (optional, shown to both parties)</Label>
          <Textarea
            id="delete-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why this review is being removed"
            className="min-h-20"
          />
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
