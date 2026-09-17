'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FolderTree,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Wrench,
  Paintbrush,
  Droplet,
  Zap,
  Home,
  Trees,
  Hammer,
  Truck,
  Sparkles,
  Bug,
  Key,
  Wind,
  Waves,
  Brush,
  Building,
  Fence,
  DoorOpen,
  PanelTop,
  Layers,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSectionCard,
  AdminConfirmDialog,
} from '@/components/admin';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  visible?: boolean;
  vendorCount: number;
}

interface UnmatchedType {
  vendorType: string;
  vendorCount: number;
}

/**
 * The picker used to be six icons, which is fewer than the number of
 * categories that exist — most could not be given a sensible one.
 */
const ICONS: Record<string, React.ElementType> = {
  Wrench, Paintbrush, Droplet, Zap, Home, Trees, Hammer, Truck,
  Sparkles, Bug, Key, Wind, Waves, Brush, Building, Fence,
  DoorOpen, PanelTop, Layers, Package,
};

const ICON_NAMES = Object.keys(ICONS);

function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  const Component = (icon && ICONS[icon]) || FolderTree;
  return <Component className={className} />;
}

const EMPTY_FORM = { name: '', slug: '', description: '', icon: 'Wrench', visible: true };

export default function ManageCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [forceDelete, setForceDelete] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catsRes, unmatchedRes] = await Promise.all([
        apiClient.get('/admin/categories'),
        apiClient.get('/admin/categories/unmatched-vendor-types'),
      ]);
      setCategories(catsRes.data || []);
      setUnmatched(unmatchedRes.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const openAdd = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelected(category);
    setForm({
      name: category.name,
      slug: category.slug ?? '',
      description: category.description ?? '',
      icon: category.icon ?? 'Wrench',
      visible: category.visible !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        icon: form.icon,
        visible: form.visible,
      };

      if (selected) {
        await apiClient.put(`/admin/categories/${selected.id}`, payload);
        toast.success('Category updated');
      } else {
        await apiClient.post('/admin/categories', payload);
        toast.success('Category created');
      }
      await fetchData();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error?.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/categories/${deleteTarget.id}?force=${forceDelete}`);
      toast.success('Category deleted');
      await fetchData();
      setDeleteTarget(null);
      setForceDelete(false);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error?.response?.data?.error || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisible = async (category: Category) => {
    try {
      await apiClient.put(`/admin/categories/${category.id}`, { visible: !(category.visible !== false) });
      // Optimistic-free: refetch so displayOrder and counts stay authoritative.
      await fetchData();
      toast.success(category.visible !== false ? 'Hidden from the public site' : 'Now visible on the public site');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  /** Moves a category one place up or down and persists the whole new order. */
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setCategories(reordered);

    try {
      await apiClient.put('/admin/categories/reorder', reordered.map((c) => c.id));
    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error('Failed to save the new order');
      await fetchData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4975A]" />
      </div>
    );
  }

  const visibleCount = categories.filter((c) => c.visible !== false).length;
  const linkedVendors = categories.reduce((sum, c) => sum + c.vendorCount, 0);
  const unmatchedVendors = unmatched.reduce((sum, u) => sum + u.vendorCount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Service categories shown on the public site"
        actions={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Add category
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Categories" value={categories.length} icon={FolderTree} tone="accent" />
        <AdminStatCard label="Visible" value={visibleCount} icon={Eye} tone="success" />
        <AdminStatCard label="Hidden" value={categories.length - visibleCount} icon={EyeOff} tone="neutral" />
        <AdminStatCard
          label="Vendors Categorised"
          value={linkedVendors}
          icon={Package}
          tone={linkedVendors === 0 ? 'danger' : 'neutral'}
          hint={unmatchedVendors ? `${unmatchedVendors} vendors uncategorised` : undefined}
        />
      </div>

      {/* The disconnect between vendors and categories, stated plainly */}
      {unmatched.length > 0 && (
        <AdminSectionCard title="Uncategorised Vendor Types" icon={AlertTriangle}>
          <p className="font-body text-sm text-[#6B5E54] mb-3">
            These vendor types exist on real vendor records but match no category, so those vendors appear
            under none of the categories below. Vendors store a free-text type (for example{' '}
            <strong>Carpenter</strong>) while categories are named differently (for example{' '}
            <strong>Carpentry</strong>) — renaming a category to match, or adding one, will link them up.
          </p>
          <div className="flex flex-wrap gap-2">
            {unmatched.map((u) => (
              <Badge key={u.vendorType} variant="warning" className="text-sm">
                {u.vendorType} · {u.vendorCount}
              </Badge>
            ))}
          </div>
        </AdminSectionCard>
      )}

      {/* Categories, in display order */}
      <AdminSectionCard title="Display Order" icon={FolderTree} contentClassName="p-0">
        <div className="divide-y divide-[#CDC0B0]/40">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FDFBF7] transition-colors">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${category.name} up`}
                  className="p-0.5 rounded text-[#9C8E82] hover:text-[#2C2621] hover:bg-[#E7DBCD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === categories.length - 1}
                  aria-label={`Move ${category.name} down`}
                  className="p-0.5 rounded text-[#9C8E82] hover:text-[#2C2621] hover:bg-[#E7DBCD] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#EEDDCC] flex items-center justify-center shrink-0">
                <CategoryIcon icon={category.icon} className="w-5 h-5 text-[#6B5E54]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-semibold text-sm text-[#2C2621]">{category.name}</p>
                  {category.visible === false && <Badge variant="secondary">Hidden</Badge>}
                  <Badge variant={category.vendorCount ? 'default' : 'outline'} className="text-xs">
                    {category.vendorCount} vendor{category.vendorCount === 1 ? '' : 's'}
                  </Badge>
                </div>
                <p className="font-body text-xs text-[#9C8E82] truncate">
                  /{category.slug}
                  {category.description ? ` · ${category.description}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisible(category)}
                  aria-label={category.visible !== false ? `Hide ${category.name}` : `Show ${category.name}`}
                >
                  {category.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white"
                  onClick={() => { setDeleteTarget(category); setForceDelete(false); }}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* Add / edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit category' : 'Add category'}</DialogTitle>
            <DialogDescription>
              {selected ? 'Update how this category appears on the public site.' : 'Create a new service category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name" className="mb-2">Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Plumbing"
                className="h-11"
              />
              <p className="font-body text-xs text-[#9C8E82] mt-1.5">
                The URL slug is generated from this automatically.
              </p>
            </div>

            <div>
              <Label htmlFor="cat-desc" className="mb-2">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What kind of work this covers"
                className="min-h-20"
              />
            </div>

            <div>
              <Label className="mb-2">Icon</Label>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {ICON_NAMES.map((name) => {
                  const Icon = ICONS[name];
                  const active = form.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: name })}
                      aria-label={name}
                      aria-pressed={active}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        active
                          ? 'bg-[#2C2621] text-white'
                          : 'bg-[#E7DBCD] text-[#6B5E54] hover:bg-[#CDC0B0]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#CDC0B0]/50 p-3">
              <div>
                <Label className="font-body font-medium text-[#2C2621]">Visible on the public site</Label>
                <p className="font-body text-xs text-[#6B5E54] mt-0.5">
                  Hidden categories stay in the database but are not offered to customers.
                </p>
              </div>
              <Switch
                checked={form.visible}
                onCheckedChange={(v) => setForm({ ...form, visible: v })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {selected ? 'Save changes' : 'Add category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AdminConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setForceDelete(false); } }}
        title={`Delete "${deleteTarget?.name}"?`}
        description={
          deleteTarget?.vendorCount
            ? `${deleteTarget.vendorCount} vendor(s) are listed under this category. Deleting it leaves them uncategorised.`
            : 'No vendors are listed under this category, so nothing will be orphaned.'
        }
        confirmLabel="Delete category"
        destructive
        isSubmitting={isSubmitting}
        disabled={Boolean(deleteTarget?.vendorCount) && !forceDelete}
        onConfirm={confirmDelete}
      >
        {!!deleteTarget?.vendorCount && (
          <label className="flex items-start gap-2.5 rounded-xl border border-[#B85C5C]/30 bg-[#B85C5C]/8 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#B85C5C] cursor-pointer shrink-0"
            />
            <span className="font-body text-sm text-[#8E4343]">
              I understand {deleteTarget.vendorCount} vendor(s) will be left without this category.
            </span>
          </label>
        )}
      </AdminConfirmDialog>
    </div>
  );
}
