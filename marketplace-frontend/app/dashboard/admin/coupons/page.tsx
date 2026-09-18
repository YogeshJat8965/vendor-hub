'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Plus, Tag, Percent, IndianRupee, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  AdminDataTable,
  AdminConfirmDialog,
  type Column,
} from '@/components/admin';

interface Plan {
  code: string;
  name: string;
}

interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  applicablePlanCodes?: string[] | null;
  expiresAt?: string | null;
  maxRedemptions?: number | null;
  redemptionCount: number;
  active: boolean;
  createdAt: string;
}

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function describeDiscount(c: Coupon) {
  return c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${rupees(c.discountValue)} off`;
}

function isExpired(c: Coupon) {
  return Boolean(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now());
}

function isExhausted(c: Coupon) {
  return c.maxRedemptions != null && c.redemptionCount >= c.maxRedemptions;
}

const EMPTY_FORM = {
  id: null as string | null,
  code: '',
  description: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
  discountValue: '',
  planCodes: [] as string[],
  expiresAt: '',
  maxRedemptions: '',
  active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [couponsRes, plansRes] = await Promise.all([
        apiClient.get('/admin/coupons'),
        apiClient.get('/admin/plans'),
      ]);
      setCoupons(couponsRes.data || []);
      setPlans((plansRes.data || []).map((r: any) => r.plan));
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const planByCode = useMemo(() => Object.fromEntries(plans.map((p) => [p.code, p])), [plans]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      id: c.id,
      code: c.code,
      description: c.description ?? '',
      discountType: c.discountType,
      discountValue: String(c.discountType === 'FLAT' ? c.discountValue / 100 : c.discountValue),
      planCodes: c.applicablePlanCodes ?? [],
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      maxRedemptions: c.maxRedemptions != null ? String(c.maxRedemptions) : '',
      active: c.active,
    });
    setEditorOpen(true);
  };

  const togglePlan = (code: string) => {
    setForm((f) => ({
      ...f,
      planCodes: f.planCodes.includes(code) ? f.planCodes.filter((p) => p !== code) : [...f.planCodes, code],
    }));
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    const value = Number(form.discountValue);
    if (!value || value <= 0) { toast.error('Enter a discount value'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: form.discountType === 'FLAT' ? Math.round(value * 100) : Math.round(value),
        applicablePlanCodes: form.planCodes.length > 0 ? form.planCodes : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt + 'T23:59:59').toISOString() : null,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        active: form.active,
      };
      if (form.id) {
        await apiClient.put(`/admin/coupons/${form.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await apiClient.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setEditorOpen(false);
      await fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await apiClient.put(`/admin/coupons/${c.id}/active`, { active: !c.active });
      toast.success(c.active ? 'Coupon deactivated' : 'Coupon activated');
      await fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update coupon');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/coupons/${deleteTarget.id}`);
      toast.success('Coupon deleted');
      setDeleteTarget(null);
      await fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Code',
      sortValue: (c) => c.code,
      cell: (c) => (
        <div className="min-w-0">
          <p className="font-mono font-medium text-[#2C2621]">{c.code}</p>
          {c.description && <p className="text-xs text-[#9C8E82] truncate max-w-[220px]">{c.description}</p>}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      sortValue: (c) => c.discountValue,
      cell: (c) => (
        <span className="inline-flex items-center gap-1 text-sm text-[#6B5E54]">
          {c.discountType === 'PERCENTAGE' ? <Percent className="w-3.5 h-3.5" /> : <IndianRupee className="w-3.5 h-3.5" />}
          {describeDiscount(c)}
        </span>
      ),
    },
    {
      key: 'plans',
      header: 'Applies to',
      hideOnMobile: true,
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {!c.applicablePlanCodes || c.applicablePlanCodes.length === 0 ? (
            <Badge variant="secondary">All plans</Badge>
          ) : (
            c.applicablePlanCodes.map((code) => (
              <Badge key={code} variant="outline">{planByCode[code]?.name ?? code}</Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Used',
      sortValue: (c) => c.redemptionCount,
      hideOnMobile: true,
      cell: (c) => (
        <span className="text-sm text-[#6B5E54] tabular-nums">
          {c.redemptionCount}{c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
        </span>
      ),
    },
    {
      key: 'expires',
      header: 'Expires',
      sortValue: (c) => (c.expiresAt ? new Date(c.expiresAt).getTime() : Infinity),
      hideOnMobile: true,
      cell: (c) => <span className="text-xs text-[#6B5E54]">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => {
        if (isExpired(c)) return <Badge variant="outline" className="text-[#9C8E82]">Expired</Badge>;
        if (isExhausted(c)) return <Badge variant="outline" className="text-[#9C8E82]">Exhausted</Badge>;
        return <Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} onClick={(e) => e.stopPropagation()} />
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        description="Discount codes vendors can apply at checkout — every rule is yours to set"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New coupon
          </Button>
        }
      />

      <AdminDataTable
        rows={coupons}
        columns={columns}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        onRowClick={openEdit}
        pageSize={15}
        emptyTitle="No coupons yet"
        emptyDescription="Create one to offer vendors a discount at checkout."
        emptyAction={<Button onClick={openCreate}><Plus className="w-4 h-4" />New coupon</Button>}
      />

      {/* Editor */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit coupon' : 'New coupon'}</DialogTitle>
            <DialogDescription>Set exactly how this code behaves at checkout.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coupon-code" className="mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Code
              </Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME20"
                className="h-11 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="coupon-desc" className="mb-2">Description (internal note, optional)</Label>
              <Textarea id="coupon-desc" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-16" placeholder="e.g. Launch week promo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Discount type</Label>
                <div className="flex rounded-xl border border-[#CDC0B0] overflow-hidden h-11">
                  {(['PERCENTAGE', 'FLAT'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, discountType: type }))}
                      className={`flex-1 text-sm font-medium transition-colors ${
                        form.discountType === type ? 'bg-[#2C2621] text-white' : 'bg-transparent text-[#6B5E54] hover:bg-[#FDFBF7]'
                      }`}
                    >
                      {type === 'PERCENTAGE' ? '% off' : '₹ off'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="coupon-value" className="mb-2">
                  {form.discountType === 'PERCENTAGE' ? 'Percentage (1–100)' : 'Amount (₹)'}
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min={1}
                  max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2">Applies to</Label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2.5 text-sm text-[#2C2621]">
                  <input
                    type="checkbox"
                    checked={form.planCodes.length === 0}
                    onChange={() => setForm((f) => ({ ...f, planCodes: [] }))}
                    className="rounded border-[#CDC0B0]"
                  />
                  All plans
                </label>
                {plans.map((p) => (
                  <label key={p.code} className="flex items-center gap-2.5 text-sm text-[#2C2621]">
                    <input
                      type="checkbox"
                      checked={form.planCodes.includes(p.code)}
                      onChange={() => togglePlan(p.code)}
                      className="rounded border-[#CDC0B0]"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-expires" className="mb-2">Expires on (optional)</Label>
                <Input id="coupon-expires" type="date" value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="h-11" />
              </div>
              <div>
                <Label htmlFor="coupon-max" className="mb-2">Max redemptions (optional)</Label>
                <Input id="coupon-max" type="number" min={1} value={form.maxRedemptions}
                  onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
                  placeholder="Unlimited" className="h-11" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#CDC0B0]/50 px-4 py-3">
              <Label htmlFor="coupon-active" className="cursor-pointer">Active</Label>
              <Switch id="coupon-active" checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
            </div>

            <Button onClick={handleSave} disabled={isSubmitting} className="w-full h-11">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {form.id ? 'Save changes' : 'Create coupon'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete coupon ${deleteTarget?.code}?`}
        description={
          deleteTarget && deleteTarget.redemptionCount > 0
            ? `${deleteTarget.redemptionCount} vendor(s) have used this coupon — it can't be deleted, only deactivated.`
            : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        destructive
        isSubmitting={isSubmitting}
        disabled={Boolean(deleteTarget && deleteTarget.redemptionCount > 0)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
