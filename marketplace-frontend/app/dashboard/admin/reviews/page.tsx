'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Trash2, Eye, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlaggedReview {
  id: string;
  reviewId: string;
  customerName: string;
  vendorName: string;
  rating: number;
  comment: string;
  date: string;
  flagReason: string;
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  reportedDate: string;
}

const mockFlaggedReviews: FlaggedReview[] = [
  {
    id: '1',
    reviewId: 'REV-001',
    customerName: 'Anonymous User',
    vendorName: 'Johns Plumbing Services',
    rating: 1,
    comment: 'This is completely inappropriate content that violates community guidelines...',
    date: '2024-02-03',
    flagReason: 'Inappropriate language and threats',
    severity: 'high',
    reportedBy: 'Sarah Johnson',
    reportedDate: '2024-02-03',
  },
  {
    id: '2',
    reviewId: 'REV-002',
    customerName: 'Mike Williams',
    vendorName: 'Elite Electrical',
    rating: 1,
    comment: 'Spam content with fake information about competitor...',
    date: '2024-02-02',
    flagReason: 'Spam/misleading information',
    severity: 'medium',
    reportedBy: 'Vendor Owner',
    reportedDate: '2024-02-02',
  },
  {
    id: '3',
    reviewId: 'REV-003',
    customerName: 'David Brown',
    vendorName: 'Perfect Painting',
    rating: 2,
    comment: 'Contains personal information and contact details...',
    date: '2024-02-01',
    flagReason: 'Personal information disclosure',
    severity: 'low',
    reportedBy: 'System Auto-flag',
    reportedDate: '2024-02-01',
  },
];

export default function ModerateReviewsPage() {
  const [flaggedReviews, setFlaggedReviews] = useState(mockFlaggedReviews);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<FlaggedReview | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'delete' | 'view' | null>(null);

  const filteredReviews = flaggedReviews.filter((review) => {
    return severityFilter === 'all' || review.severity === severityFilter;
  });

  const severityCounts = {
    all: flaggedReviews.length,
    high: flaggedReviews.filter((r) => r.severity === 'high').length,
    medium: flaggedReviews.filter((r) => r.severity === 'medium').length,
    low: flaggedReviews.filter((r) => r.severity === 'low').length,
  };

  const handleApprove = () => {
    if (selectedReview) {
      setFlaggedReviews(flaggedReviews.filter((r) => r.id !== selectedReview.id));
      // TODO: Call API to approve/unflag review
      console.log('Approve review:', selectedReview.id);
      setActionDialog(null);
      setSelectedReview(null);
    }
  };

  const handleDelete = () => {
    if (selectedReview) {
      setFlaggedReviews(flaggedReviews.filter((r) => r.id !== selectedReview.id));
      // TODO: Call API to delete review
      console.log('Delete review:', selectedReview.id);
      setActionDialog(null);
      setSelectedReview(null);
    }
  };

  const getSeverityBadge = (severity: FlaggedReview['severity']) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-yellow-100 text-yellow-700',
    };
    return <Badge className={styles[severity]}>{severity.toUpperCase()}</Badge>;
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Moderate Flagged Reviews</h1>
        <p className="text-gray-600">Review and moderate flagged content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{severityCounts.all}</p>
            <p className="text-sm text-gray-600">Total Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{severityCounts.high}</p>
            <p className="text-sm text-gray-600">High Severity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{severityCounts.medium}</p>
            <p className="text-sm text-gray-600">Medium Severity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{severityCounts.low}</p>
            <p className="text-sm text-gray-600">Low Severity</p>
          </CardContent>
        </Card>
      </div>

      {/* Severity Filter */}
      <Tabs value={severityFilter} onValueChange={setSeverityFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({severityCounts.all})</TabsTrigger>
          <TabsTrigger value="high">High ({severityCounts.high})</TabsTrigger>
          <TabsTrigger value="medium">Medium ({severityCounts.medium})</TabsTrigger>
          <TabsTrigger value="low">Low ({severityCounts.low})</TabsTrigger>
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
                          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                        </div>
                      </div>
                    </div>
                    {getSeverityBadge(review.severity)}
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
                        <p className="text-sm text-gray-700">{review.flagReason}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Reported by {review.reportedBy} on {formatDate(review.reportedDate)}
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
                      Approve Review
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
                      Delete Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={actionDialog === 'approve'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Review</DialogTitle>
            <DialogDescription>
              This review will be marked as safe and the flag will be removed. The review will remain visible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={actionDialog === 'delete'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently removed from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
