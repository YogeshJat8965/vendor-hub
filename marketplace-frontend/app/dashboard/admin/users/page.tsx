'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ban,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  FileText,
  MessageSquare,
  Undo2,
  PauseCircle,
} from 'lucide-react';
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
  AdminPlanBadge,
  AdminConfirmDialog,
  exportToCsv,
  type Column,
  type FilterPill,
} from '@/components/admin';

/**
 * A unified directory over two entirely separate backend collections:
 * customers and admins live in `users`, vendors live in their own `vendors`
 * collection with a different status vocabulary. Merging them here is the only
 * way a "vendors vs customers" filter can work — a vendor will never appear in
 * /admin/users no matter how that endpoint is queried.
 */
type PersonRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

interface Person {
  id: string;
  name: string;
  email: string;
  role: PersonRole;
  createdAt: string | null;
  /**
   * Customers/admins: ACTIVE or BANNED, derived server-side from User.banned.
   * Vendors: the real Vendor.status — PENDING / ACTIVE / REJECTED / SUSPENDED.
   */
  status: string;
  vendorType?: string;
  phone?: string;
  city?: string;
  slug?: string;
  rating?: number | null;
  reviewCount?: number | null;
  subscriptionPlan?: string;
  rejectionReason?: string;
}

type PillValue = 'all' | 'customers' | 'vendors' | 'admins' | 'banned' | 'pending';

interface PersonDetail {
  profile: Record<string, any>;
  stats: Record<string, any>;
  quotes: any[];
  reviews: any[];
}

const ROLE_ICONS: Record<PersonRole, typeof UserIcon> = {
  CUSTOMER: UserIcon,
  VENDOR: Building2,
  ADMIN: ShieldCheck,
};

const ROLE_STYLES: Record<PersonRole, string> = {
  CUSTOMER: 'bg-[#6B8CAE]/12 text-[#3F5A75]',
  VENDOR: 'bg-[#8A7BA8]/14 text-[#5B4F73]',
  ADMIN: 'bg-[#2C2621] text-[#EEDDCC]',
};

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [pill, setPill] = useState<PillValue>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [plans, setPlans] = useState<{ code: string; name: string; badgeColor?: string }[]>([]);

  const [selected, setSelected] = useState<Person | null>(null);
  const [action, setAction] = useState<'ban' | 'unban' | 'approve' | 'reject' | 'suspend' | 'reinstate' | null>(null);
  const [reason, setReason] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPeople = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, vendorsRes, plansRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/vendors'),
        apiClient.get('/admin/plans'),
      ]);
      setPlans((plansRes.data || []).map((r: any) => r.plan));

      const accounts: Person[] = (usersRes.data || []).map((u: any) => ({
        id: u.id,
        name: u.name || u.email,
        email: u.email,
        role: (u.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER') as PersonRole,
        createdAt: u.createdAt,
        // Sent by the backend now; no longer inferred in the browser.
        status: u.status,
      }));

      const vendors: Person[] = (vendorsRes.data || []).map((v: any) => ({
        id: v.id,
        name: v.displayName || v.email,
        email: v.email,
        role: 'VENDOR' as const,
        createdAt: v.createdAt,
        status: v.status,
        vendorType: v.vendorType,
        phone: v.phone || v.mobile,
        city: v.city,
        slug: v.slug,
        rating: v.rating,
        reviewCount: v.reviewCount,
        subscriptionPlan: v.subscriptionPlan,
        rejectionReason: v.rejectionReason,
      }));

      setPeople([...accounts, ...vendors]);
    } catch (error) {
      console.error('Failed to fetch directory:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchPeople();
  }, [currentUser, fetchPeople]);

  // Counts drive both the stat cards and the pill badges, so the number on a
  // pill can never disagree with the list that pill produces.
  const counts = useMemo(() => ({
    all: people.length,
    customers: people.filter((p) => p.role === 'CUSTOMER').length,
    vendors: people.filter((p) => p.role === 'VENDOR').length,
    admins: people.filter((p) => p.role === 'ADMIN').length,
    banned: people.filter((p) => p.status === 'BANNED').length,
    pending: people.filter((p) => p.status === 'PENDING').length,
    suspended: people.filter((p) => p.status === 'SUSPENDED').length,
  }), [people]);

  const vendorTypes = useMemo(
    () => [...new Set(people.filter((p) => p.vendorType).map((p) => p.vendorType!))].sort(),
    [people]
  );

  const matchesPill = useCallback((person: Person, value: PillValue) => {
    switch (value) {
      case 'all': return true;
      case 'customers': return person.role === 'CUSTOMER';
      case 'vendors': return person.role === 'VENDOR';
      case 'admins': return person.role === 'ADMIN';
      case 'banned': return person.status === 'BANNED';
      case 'pending': return person.status === 'PENDING';
      default: return true;
    }
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return people.filter((person) => {
      if (!matchesPill(person, pill)) return false;
      if (typeFilter !== 'all' && person.vendorType !== typeFilter) return false;
      if (planFilter !== 'all' && person.subscriptionPlan !== planFilter) return false;
      if (!query) return true;
      // Searches every field the row can display, so a result is never
      // invisible because the match was in a column the user can see.
      return [person.name, person.email, person.phone, person.city, person.vendorType]
        .some((field) => field?.toLowerCase().includes(query));
    });
  }, [people, pill, typeFilter, planFilter, search, matchesPill]);

  const pills: FilterPill<PillValue>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'customers', label: 'Customers', count: counts.customers },
    { value: 'vendors', label: 'Vendors', count: counts.vendors },
    { value: 'admins', label: 'Admins', count: counts.admins },
    { value: 'pending', label: 'Pending approval', count: counts.pending, tone: 'warning' },
    { value: 'banned', label: 'Banned', count: counts.banned, tone: 'danger' },
  ];

  const openDetail = async (person: Person) => {
    setSelected(person);
    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const path = person.role === 'VENDOR'
        ? `/admin/vendors/${person.id}/detail`
        : `/admin/users/${person.id}/detail`;
      const res = await apiClient.get(path);
      setDetail(res.data);
    } catch (error) {
      console.error('Failed to load detail:', error);
      toast.error('Failed to load details');
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
      const endpoints: Record<string, { url: string; body?: any; message: string }> = {
        ban: { url: `/admin/users/${selected.id}/ban`, message: `${selected.name} has been banned` },
        unban: { url: `/admin/users/${selected.id}/unban`, message: `${selected.name} has been unbanned` },
        approve: { url: `/admin/vendors/${selected.id}/approve`, message: `${selected.name} approved` },
        reject: { url: `/admin/vendors/${selected.id}/reject`, body: { reason }, message: `${selected.name} rejected` },
        suspend: { url: `/admin/vendors/${selected.id}/suspend`, body: { reason }, message: `${selected.name} suspended` },
        reinstate: { url: `/admin/vendors/${selected.id}/reinstate`, message: `${selected.name} reinstated` },
      };

      const config = endpoints[action];
      await apiClient.put(config.url, config.body);
      toast.success(config.message);
      await fetchPeople();
      setAction(null);
      setSelected(null);
      setReason('');
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(error?.response?.data?.error || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ok = exportToCsv(`vendorhub-users-${pill}`, filtered, [
      { header: 'Name', value: (p) => p.name },
      { header: 'Email', value: (p) => p.email },
      { header: 'Role', value: (p) => p.role },
      { header: 'Status', value: (p) => p.status },
      { header: 'Vendor type', value: (p) => p.vendorType ?? '' },
      { header: 'Phone', value: (p) => p.phone ?? '' },
      { header: 'City', value: (p) => p.city ?? '' },
      { header: 'Joined', value: (p) => formatDate(p.createdAt) },
    ]);
    if (ok) toast.success(`Exported ${filtered.length} record${filtered.length === 1 ? '' : 's'}`);
    else toast.error('Nothing to export — no rows match the current filters');
  };

  /** An admin must not be able to ban themselves out of the panel. */
  const isSelf = (person: Person) =>
    person.role !== 'VENDOR' && person.email === currentUser?.email;

  const columns: Column<Person>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (p) => p.name?.toLowerCase() ?? '',
      cell: (p) => {
        const Icon = ROLE_ICONS[p.role];
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${ROLE_STYLES[p.role]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[#2C2621] truncate">{p.name}</p>
              <p className="text-xs text-[#9C8E82] truncate">{p.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      sortValue: (p) => p.role,
      hideOnMobile: true,
      cell: (p) => (
        <Badge variant="outline" className={ROLE_STYLES[p.role]}>
          {p.role.charAt(0) + p.role.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.status ?? '',
      cell: (p) => <AdminStatusBadge status={p.status} />,
    },
    {
      key: 'plan',
      header: 'Plan',
      sortValue: (p) => p.subscriptionPlan ?? '',
      hideOnMobile: true,
      cell: (p) => p.role === 'VENDOR' ? <AdminPlanBadge planCode={p.subscriptionPlan} plans={plans} /> : <span className="text-xs text-[#9C8E82]">—</span>,
    },
    {
      key: 'detail',
      header: 'Details',
      hideOnMobile: true,
      cell: (p) =>
        p.role === 'VENDOR' ? (
          <div className="text-xs text-[#6B5E54]">
            <p>{p.vendorType || 'Unspecified'}</p>
            {p.city && <p className="text-[#9C8E82]">{p.city}</p>}
          </div>
        ) : (
          <span className="text-xs text-[#9C8E82]">—</span>
        ),
    },
    {
      key: 'joined',
      header: 'Joined',
      sortValue: (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0),
      hideOnMobile: true,
      cell: (p) => <span className="text-xs text-[#6B5E54]">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); openDetail(p); }}
            aria-label={`View ${p.name}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {renderRowAction(p)}
        </div>
      ),
    },
  ];

  /**
   * Actions differ by what the row actually is: banning is a `users`-collection
   * operation and is meaningless for a vendor, whose lifecycle is
   * approve/reject/suspend instead.
   */
  function renderRowAction(person: Person) {
    if (person.role === 'ADMIN') {
      return <span className="text-xs text-[#9C8E82] px-2">Protected</span>;
    }

    if (person.role === 'CUSTOMER') {
      if (isSelf(person)) return <span className="text-xs text-[#9C8E82] px-2">You</span>;
      return person.status === 'BANNED' ? (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('unban'); }}>
          <Undo2 className="w-4 h-4" />
          Unban
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
          onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('ban'); }}>
          <Ban className="w-4 h-4" />
          Ban
        </Button>
      );
    }

    // Vendor
    if (person.status === 'PENDING') {
      return (
        <>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('approve'); }}>
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </Button>
          <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
            onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('reject'); setReason(''); }}>
            <XCircle className="w-4 h-4" />
          </Button>
        </>
      );
    }
    if (person.status === 'ACTIVE') {
      return (
        <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
          onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('suspend'); setReason(''); }}>
          <PauseCircle className="w-4 h-4" />
          Suspend
        </Button>
      );
    }
    // SUSPENDED or REJECTED
    return (
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(person); setAction('reinstate'); }}>
        <Undo2 className="w-4 h-4" />
        Reinstate
      </Button>
    );
  }

  const actionCopy: Record<string, { title: string; description: string; confirm: string; destructive: boolean }> = {
    ban: {
      title: `Ban ${selected?.name}?`,
      description: 'They will be locked out of their account and notified. You can undo this at any time.',
      confirm: 'Ban account', destructive: true,
    },
    unban: {
      title: `Unban ${selected?.name}?`,
      description: 'Their account will be restored and they will be notified.',
      confirm: 'Restore account', destructive: false,
    },
    approve: {
      title: `Approve ${selected?.name}?`,
      description: 'Their storefront goes live on VendorHub and they will be notified.',
      confirm: 'Approve vendor', destructive: false,
    },
    reject: {
      title: `Reject ${selected?.name}?`,
      description: 'The reason below is saved and sent to the vendor in their notification.',
      confirm: 'Reject vendor', destructive: true,
    },
    suspend: {
      title: `Suspend ${selected?.name}?`,
      description: 'Their storefront is taken offline. A reason is optional but is sent to them if given.',
      confirm: 'Suspend vendor', destructive: true,
    },
    reinstate: {
      title: `Reinstate ${selected?.name}?`,
      description: 'Their account returns to active and they will be notified.',
      confirm: 'Reinstate vendor', destructive: false,
    },
  };

  const copy = action ? actionCopy[action] : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Every customer, vendor and admin on the platform"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Total People" value={counts.all} icon={UserIcon} tone="accent" />
        <AdminStatCard label="Customers" value={counts.customers} icon={UserIcon} tone="neutral" />
        <AdminStatCard label="Vendors" value={counts.vendors} icon={Building2} tone="success" />
        <AdminStatCard
          label="Needs Attention"
          value={counts.banned + counts.pending + counts.suspended}
          icon={Ban}
          tone={counts.banned + counts.pending + counts.suspended ? 'danger' : 'neutral'}
          hint={`${counts.pending} pending · ${counts.banned} banned · ${counts.suspended} suspended`}
        />
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone, city or vendor type…"
        pills={pills}
        activePill={pill}
        onPillChange={(value) => setPill(value)}
      >
        {vendorTypes.length > 0 && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue placeholder="All vendor types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendor types</SelectItem>
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
        rowKey={(p) => `${p.role}-${p.id}`}
        isLoading={isLoading}
        onRowClick={openDetail}
        pageSize={15}
        emptyTitle="No people match these filters"
        emptyDescription="Try a different filter or clear the search."
      />

      {/* Confirmations */}
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
              <Label htmlFor="reason" className="mb-2">
                Reason {action === 'reject' ? '*' : '(optional)'}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the decision — the vendor sees this"
                className="min-h-24"
              />
            </div>
          )}
        </AdminConfirmDialog>
      )}

      {/* Detail panel */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name ?? 'Details'}</DialogTitle>
            <DialogDescription>
              {selected ? `${selected.role.charAt(0)}${selected.role.slice(1).toLowerCase()} · ${selected.email}` : ''}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#C4975A]" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Profile facts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Fact icon={Mail} label="Email" value={selected?.email} />
                <Fact icon={Calendar} label="Joined" value={formatDate(selected?.createdAt)} />
                {selected?.phone && <Fact icon={Phone} label="Phone" value={selected.phone} />}
                {selected?.city && <Fact icon={MapPin} label="City" value={selected.city} />}
                {selected?.vendorType && <Fact icon={Building2} label="Type" value={selected.vendorType} />}
                {detail.stats?.subscription && (
                  <Fact
                    icon={Star}
                    label="Subscription"
                    value={`${detail.stats.subscription.plan} · ${detail.stats.subscription.status}`}
                  />
                )}
              </div>

              {selected?.rejectionReason && (
                <div className="rounded-xl border border-[#B85C5C]/30 bg-[#B85C5C]/8 p-3">
                  <p className="text-xs font-semibold text-[#8E4343] mb-1">Reason on file</p>
                  <p className="text-sm text-[#6B5E54] break-words">{selected.rejectionReason}</p>
                </div>
              )}

              {/* Activity stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat icon={FileText} label="Quotes" value={detail.stats?.totalQuotes ?? 0} />
                <MiniStat icon={CheckCircle2} label="Completed" value={detail.stats?.completedQuotes ?? 0} />
                <MiniStat icon={Star} label="Reviews" value={detail.stats?.totalReviews ?? 0} />
                <MiniStat icon={MessageSquare} label="Chats" value={detail.stats?.conversations ?? 0} />
              </div>

              {(detail.stats?.averageRating !== undefined && detail.stats?.averageRating !== null) && (
                <p className="text-sm text-[#6B5E54]">
                  Average rating received: <strong className="text-[#2C2621]">{detail.stats.averageRating}★</strong>
                  {detail.stats.completionRate !== null && detail.stats.completionRate !== undefined &&
                    ` · Completion rate: ${detail.stats.completionRate}%`}
                </p>
              )}
              {(detail.stats?.averageRatingGiven !== undefined && detail.stats?.averageRatingGiven !== null) && (
                <p className="text-sm text-[#6B5E54]">
                  Average rating given: <strong className="text-[#2C2621]">{detail.stats.averageRatingGiven}★</strong>
                </p>
              )}

              {/* Recent quotes */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-2">Recent quotes</h4>
                {detail.quotes?.length ? (
                  <div className="space-y-2">
                    {detail.quotes.map((q: any) => (
                      <div key={q.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#CDC0B0]/50 p-3">
                        <div className="min-w-0">
                          <p className="text-sm text-[#2C2621] break-words">{q.service || 'Untitled request'}</p>
                          <p className="text-xs text-[#9C8E82]">
                            {selected?.role === 'VENDOR' ? q.customerName : q.vendorSlug} · {formatDate(q.createdAt)}
                          </p>
                        </div>
                        <AdminStatusBadge status={q.status} className="shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9C8E82]">No quotes yet.</p>
                )}
              </div>

              {/* Recent reviews */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-[#2C2621] mb-2">Recent reviews</h4>
                {detail.reviews?.length ? (
                  <div className="space-y-2">
                    {detail.reviews.map((r: any) => (
                      <div key={r.id} className="rounded-xl border border-[#CDC0B0]/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#C4975A]">{r.rating}★</span>
                          <span className="text-xs text-[#9C8E82]">
                            {selected?.role === 'VENDOR' ? r.customerName : r.vendorSlug} · {formatDate(r.createdAt)}
                          </span>
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
            <p className="text-sm text-[#9C8E82] py-6">Could not load details.</p>
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
