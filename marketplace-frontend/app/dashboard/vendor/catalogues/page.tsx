'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Folder, Image as ImageIcon, Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

/** What /api/vendor/plan reports — the single server-side source for limits. */
interface PlanInfo {
  plan: { code: string; name: string };
  limits: { maxCatalogues: number };
  usage: {
    cataloguesUsed: number;
    cataloguesRemaining: number | null;
    cataloguesVisible: number;
    cataloguesLocked: number;
    overCatalogueLimit: boolean;
  };
}

export default function CataloguesPage() {
  const { user } = useAuth();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchCatalogues();
    }
  }, [user]);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const [cataloguesRes, planRes] = await Promise.all([
        fetch(`${apiUrl}/api/vendor/catalogues?email=${user?.email}`, { headers }),
        fetch(`${apiUrl}/api/vendor/plan`, { headers }),
      ]);

      if (!cataloguesRes.ok) throw new Error('Failed to fetch catalogues');
      setCatalogues(await cataloguesRes.json());
      if (planRes.ok) setPlanInfo(await planRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const atCatalogueLimit =
    planInfo != null &&
    planInfo.limits.maxCatalogues !== -1 &&
    planInfo.usage.cataloguesUsed >= planInfo.limits.maxCatalogues;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalogue?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiUrl}/api/vendor/catalogues/${id}?email=${user?.email}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to delete catalogue');
      setCatalogues(catalogues.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#FDFBF7] p-4 sm:p-8 rounded-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#2C2621]">My Catalogues</h1>
          <p className="text-[#6B5E54] font-body mt-2">Manage and showcase your services and designs.</p>
        </div>
        <div className="flex items-center gap-3">
          {planInfo && (
            <div className="text-right">
              <p className="font-body text-sm text-[#2C2621] tabular-nums">
                {planInfo.usage.cataloguesUsed} of{' '}
                {planInfo.limits.maxCatalogues === -1 ? '∞' : planInfo.limits.maxCatalogues} catalogues
              </p>
              <p className="font-body text-xs text-[#9C8E82]">{planInfo.plan.name} plan</p>
            </div>
          )}
          {atCatalogueLimit ? (
            <Link href="/pricing">
              <Button
                variant="outline"
                className="rounded-xl border-[#C4975A] text-[#C4975A] hover:bg-[#C4975A] hover:text-white font-body px-6"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" /> Upgrade for more
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/vendor/catalogues/new">
              <Button className="bg-[#C4975A] hover:bg-[#B38549] text-white shadow-warm-md hover:shadow-warm-lg transition-all rounded-xl font-body px-6">
                <Plus className="mr-2 h-4 w-4" /> Create Catalogue
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* A downgrade or a lowered admin limit hides content without deleting it —
          the vendor is told plainly rather than finding catalogues missing. */}
      {planInfo && planInfo.usage.cataloguesLocked > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#C4975A]/40 bg-[#C4975A]/8 p-4">
          <Lock className="h-5 w-5 text-[#C4975A] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm text-[#8A6534]">
              {planInfo.usage.cataloguesLocked} catalogue
              {planInfo.usage.cataloguesLocked === 1 ? ' is' : 's are'} hidden from customers
            </p>
            <p className="font-body text-sm text-[#6B5E54] mt-1">
              The {planInfo.plan.name} plan shows {planInfo.limits.maxCatalogues}. Nothing has been deleted —
              everything reappears the moment you upgrade.
            </p>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button size="sm" variant="outline" className="rounded-xl border-[#C4975A] text-[#C4975A] hover:bg-[#C4975A] hover:text-white">
              View plans
            </Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-[#B85C5C]/10 text-[#B85C5C] p-4 rounded-xl font-body border border-[#B85C5C]/20">{error}</div>
      ) : catalogues.length === 0 ? (
        <Card className="border-dashed border-2 border-[#CDC0B0] bg-white rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-[#EEDDCC]/50 p-4 rounded-2xl mb-6 border border-[#CDC0B0]/50">
              <Folder className="h-10 w-10 text-[#2C2621]" />
            </div>
            <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-3">No Catalogues Yet</h3>
            <p className="text-[#6B5E54] font-body mb-8 max-w-sm text-center">
              Create your first catalogue to showcase your designs and services to potential customers.
            </p>
            <Link href="/dashboard/vendor/catalogues/new">
              <Button variant="outline" className="border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] rounded-xl font-body">
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogues.map((catalogue, index) => (
            <motion.div
              key={catalogue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`overflow-hidden hover:shadow-warm-lg transition-shadow duration-300 bg-white rounded-3xl h-full flex flex-col ${
                  catalogue.locked ? 'border-[#C4975A]/50 border-dashed' : 'border-[#CDC0B0]'
                }`}
              >
                <div className={`h-56 bg-[#FDFBF7] relative border-b border-[#CDC0B0] ${catalogue.locked ? 'opacity-50' : ''}`}>
                  {(() => {
                    const firstImg = catalogue.coverImage || catalogue.items?.find((i: any) => i.images?.length > 0)?.images?.[0];
                    return firstImg ? (
                      <img 
                        src={firstImg.startsWith('http') ? firstImg : `${process.env.NEXT_PUBLIC_API_URL}${firstImg}`} 
                        alt={catalogue.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#CDB79E]">
                        <ImageIcon className="h-12 w-12 opacity-50" />
                      </div>
                    );
                  })()}
                  {catalogue.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#2C2621]/10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-body text-xs font-semibold text-[#8A6534] shadow-warm-sm">
                        <Lock className="h-3.5 w-3.5" />
                        Hidden from customers
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="line-clamp-1 font-heading text-xl text-[#2C2621]">{catalogue.name}</CardTitle>
                  <CardDescription className="line-clamp-2 font-body text-[#6B5E54] leading-relaxed mt-2">{catalogue.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm font-body text-[#9C8E82]">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FDFBF7] rounded-lg border border-[#CDC0B0]/30">{catalogue.items?.length || 0} Items</span>
                    <span>Updated: {new Date(catalogue.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-[#CDC0B0]/50 bg-[#FDFBF7] pt-4 pb-4">
                  <Link href={`/dashboard/vendor/catalogues/${catalogue.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-[#CDC0B0] hover:bg-[#EEDDCC]/50 text-[#2C2621] hover:border-[#9C8E82] font-body transition-colors">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="rounded-xl text-[#B85C5C] hover:bg-[#B85C5C]/10 font-body transition-colors" onClick={() => handleDelete(catalogue.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
