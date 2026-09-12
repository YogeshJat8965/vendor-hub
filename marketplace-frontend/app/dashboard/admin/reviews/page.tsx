'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Trash2, Eye, Star, Loader2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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

const REASON_BADGE_STYLES: Record<FlagReason, string> = {
  FAKE: 'bg-red-100 text-red-700',
  COMPETITOR: 'bg-red-100 text-red-700',
  OFFENSIVE: 'bg-orange-100 text-orange-700',
  SPAM: 'bg-yellow-100 text-yellow-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

interface FlaggedReview {
  id: string;
  vendorSlug: string;
  vendorName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  flagReason: FlagReason;
  flagDetails?: string;
  flaggedAt: string;
  createdAt: string;
}

export default function ModerateReviewsPage() {
  const { user } = useAuth();
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonFilter, setReasonFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<FlaggedReview | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'delete' | 'view' | null>(null);

  useEffect(() => {
    if (user) {
      fetchFlaggedReviews();
    }
  }, [user]);

  const fetchFlaggedReviews = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/reviews/flagged');
      setFlaggedReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch flagged reviews:', error);
      toast.error('Failed to load flagged reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = flaggedReviews.filter((review) => {
    return reasonFilter === 'all' || review.flagReason === reasonFilter;
  });

  const reasonCounts = {
    all: flaggedReviews.length,
    FAKE: flaggedReviews.filter((r) => r.flagReason === 'FAKE').length,
    COMPETITOR: flaggedReviews.filter((r) => r.flagReason === 'COMPETITOR').length,
    OFFENSIVE: flaggedReviews.filter((r) => r.flagReason === 'OFFENSIVE').length,
    SPAM: flaggedReviews.filter((r) => r.flagReason === 'SPAM').length,
    OTHER: flaggedReviews.filter((r) => r.flagReason === 'OTHER').length,
  };

  const handleApprove = async () => {
    if (!selectedReview) return;

    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/reviews/${selectedReview.id}/unflag`);
      toast.success('Review restored — it now counts toward the vendor’s rating again');
      await fetchFlaggedReviews();
      setActionDialog(null);
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to approve review:', error);
      toast.error('Failed to approve review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/reviews/${selectedReview.id}`);
      toast.success('Review deleted permanently');
      await fetchFlaggedReviews();
      setActionDialog(null);
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (filteredReviews.length === 0) {
      toast.info('Nothing to export');
      return;
    }

    const csvData = filteredReviews.map((review) => ({
      'Review ID': review.id,
      Customer: review.customerName,
      Vendor: review.vendorName,
      Rating: review.rating,
      Comment: review.comment.replace(/"/g, '""'),
      'Flag Reason': REASON_LABELS[review.flagReason] || review.flagReason,
      'Flag Details': (review.flagDetails || '').replace(/"/g, '""'),
      'Flagged Date': review.flaggedAt ? new Date(review.flaggedAt).toLocaleDateString() : '',
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flagged_reviews_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Reviews data exported successfully');
  };

  const getReasonBadge = (reason: FlagReason) => (
    <Badge className={REASON_BADGE_STYLES[reason] || REASON_BADGE_STYLES.OTHER}>
      {REASON_LABELS[reason] || reason}
    </Badge>
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Moderate Flagged Reviews</h1>
          <p className="text-gray-600">
            Reviews vendors have disputed — each is excluded from its vendor&apos;s public rating until you decide.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{reasonCounts.all}</p>
            <p className="text-sm text-gray-600">Total Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{reasonCounts.FAKE}</p>
            <p className="text-sm text-gray-600">Suspected Fake</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{reasonCounts.COMPETITOR}</p>
            <p className="text-sm text-gray-600">Suspected Competitor</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {reasonCounts.OFFENSIVE + reasonCounts.SPAM + reasonCounts.OTHER}
            </p>
            <p className="text-sm text-gray-600">Offensive / Spam / Other</p>
          </CardContent>
        </Card>
      </div>

      {/* Reason Filter */}
      <Tabs value={reasonFilter} onValueChange={setReasonFilter}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="all" className="py-2">All ({reasonCounts.all})</TabsTrigger>
          <TabsTrigger value="FAKE" className="py-2">Fake ({reasonCounts.FAKE})</TabsTrigger>
          <TabsTrigger value="COMPETITOR" className="py-2">Competitor ({reasonCounts.COMPETITOR})</TabsTrigger>
          <TabsTrigger value="OFFENSIVE" className="py-2">Offensive ({reasonCounts.OFFENSIVE})</TabsTrigger>
          <TabsTrigger value="SPAM" className="py-2">Spam ({reasonCounts.SPAM})</TabsTrigger>
          <TabsTrigger value="OTHER" className="py-2">Other ({reasonCounts.OTHER})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Flagged Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No flagged reviews</h3>
              <p className="text-gray-600">All reviews have been moderated</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500">
                        <AvatarFallback className="bg-transparent text-white">
                          {review.customerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.customerName}</h3>
                        <p className="text-sm text-gray-600">
                          Review for <span className="font-medium">{review.vendorName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {getReasonBadge(review.flagReason)}
                  </div>

                  {/* Review Content */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {/* Flag Details */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Flag Reason:</p>
                        <p className="text-sm text-gray-700">{REASON_LABELS[review.flagReason] || review.flagReason}</p>
                        {review.flagDetails && (
                          <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{review.flagDetails}&rdquo;</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Flagged by {review.vendorName} on {formatDate(review.flaggedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review);
                        setActionDialog('view');
                      }}
                      className="touch-target"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 touch-target"
                      onClick={() => {
                        setSelectedReview(review);
                        setActionDialog('approve');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Dismiss Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 touch-target"
                      onClick={() => {
                        setSelectedReview(review);
                        setActionDialog('delete');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Uphold & Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={actionDialog === 'view'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedReview.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedReview.customerEmail}</p>
                </div>
                {renderStars(selectedReview.rating)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Vendor</p>
                <p className="text-sm text-gray-700">{selectedReview.vendorName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Review</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{selectedReview.comment}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Flag Reason</p>
                <p className="text-sm text-gray-700">
                  {REASON_LABELS[selectedReview.flagReason] || selectedReview.flagReason}
                </p>
                {selectedReview.flagDetails && (
                  <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{selectedReview.flagDetails}&rdquo;</p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Submitted {formatDate(selectedReview.createdAt)} &middot; Flagged {formatDate(selectedReview.flaggedAt)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={actionDialog === 'approve'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Flag</DialogTitle>
            <DialogDescription>
              This review will be marked as safe and the flag will be removed. It will remain visible and count
              toward the vendor&apos;s rating again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dismissing...
                </>
              ) : (
                'Dismiss Flag'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uphold Flag & Delete Review</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently removed from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
