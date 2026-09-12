'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface DisputedQuote {
  id: string;
  vendorSlug: string;
  customerName?: string;
  customerEmail: string;
  serviceRequested: string;
  projectDescription: string;
  disputeReason?: string;
  disputedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export default function DisputedQuotesPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<DisputedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputedQuote | null>(null);
  const [actionDialog, setActionDialog] = useState<'complete' | 'reopen' | null>(null);

  useEffect(() => {
    if (user) {
      fetchDisputes();
    }
  }, [user]);

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/quotes/disputed');
      setDisputes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  const resolve = async (resolution: 'COMPLETE' | 'REOPEN') => {
    if (!selectedDispute) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/quotes/${selectedDispute.id}/resolve-dispute`, { resolution });
      toast.success(
        resolution === 'COMPLETE'
          ? 'Resolved — marked as completed'
          : 'Reopened — vendor will need to redeliver'
      );
      await fetchDisputes();
      setActionDialog(null);
      setSelectedDispute(null);
    } catch (error: any) {
      console.error('Failed to resolve dispute:', error);
      toast.error(error?.response?.data?.error || 'Failed to resolve dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Disputes</h1>
        <p className="text-gray-600">
          Customers who reported a problem instead of confirming completion — each is on hold and won&apos;t
          auto-complete until you resolve it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{disputes.length}</p>
            <p className="text-sm text-gray-600">Awaiting Resolution</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No open disputes</h3>
              <p className="text-gray-600">Everything delivered is either confirmed or still in progress</p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{dispute.serviceRequested}</h3>
                      <p className="text-sm text-gray-600">
                        {dispute.customerName || dispute.customerEmail} &rarr;{' '}
                        <span className="font-medium">{dispute.vendorSlug}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                      Disputed
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{dispute.projectDescription}</p>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">What the customer reported:</p>
                        <p className="text-sm text-gray-700 mt-1">{dispute.disputeReason}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Delivered {formatDate(dispute.deliveredAt)} &middot; Disputed {formatDate(dispute.disputedAt)}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setActionDialog('complete');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Side With Vendor & Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setActionDialog('reopen');
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reopen for Vendor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={actionDialog === 'complete'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Side With Vendor & Complete</DialogTitle>
            <DialogDescription>
              The quote will be marked Completed, as if the customer had confirmed it themselves — this makes it
              eligible for a review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={() => resolve('COMPLETE')} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                'Mark Completed'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'reopen'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen for Vendor</DialogTitle>
            <DialogDescription>
              The quote goes back to Accepted so the vendor can address the issue and redeliver. Both parties are
              notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={() => resolve('REOPEN')} className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reopening...
                </>
              ) : (
                'Reopen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
