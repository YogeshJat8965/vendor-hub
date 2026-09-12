'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface WriteReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendorSlug: string;
  vendorName?: string;
  onSubmitted?: () => void;
}

interface Eligibility {
  eligible: boolean;
  alreadyReviewed: boolean;
  reason: 'ALREADY_REVIEWED' | 'NO_ACCEPTED_QUOTE' | null;
}

const MIN_COMMENT_LENGTH = 10;

export function WriteReviewDialog({ isOpen, onClose, vendorSlug, vendorName, onSubmitted }: WriteReviewDialogProps) {
  const [checking, setChecking] = useState(true);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !vendorSlug) return;

    let cancelled = false;
    setChecking(true);
    setEligibility(null);
    setRating(0);
    setHoverRating(0);
    setComment('');

    apiClient
      .get('/reviews/eligibility', { params: { vendorSlug } })
      .then((res) => {
        if (!cancelled) setEligibility(res.data);
      })
      .catch(() => {
        if (!cancelled) setEligibility({ eligible: false, alreadyReviewed: false, reason: 'NO_ACCEPTED_QUOTE' });
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, vendorSlug]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      toast.error(`Please write at least ${MIN_COMMENT_LENGTH} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/reviews', { vendorSlug, rating, comment: comment.trim() });
      toast.success('Review submitted — thank you for your feedback!');
      onSubmitted?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInfoState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="p-8 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-[#F2ECE4] rounded-full flex items-center justify-center mb-6">{icon}</div>
      <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">{title}</DialogTitle>
      <DialogDescription className="font-body text-[#6B5E54] text-base mb-8 px-2">{description}</DialogDescription>
      <Button
        variant="outline"
        onClick={onClose}
        className="w-full h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
      >
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-[#CDC0B0]/50 rounded-3xl" showCloseButton={true}>
        <AnimatePresence mode="wait">
          {checking ? (
            <motion.div key="loading" className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-[#C4975A] animate-spin" />
              <p className="font-body text-[#6B5E54] text-sm">Checking eligibility...</p>
            </motion.div>
          ) : eligibility?.alreadyReviewed ? (
            <motion.div key="already" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderInfoState(
                <CheckCircle2 className="w-10 h-10 text-[#8A9A5B]" />,
                'Already Reviewed',
                `You've already reviewed ${vendorName || 'this vendor'}. Thanks for sharing your feedback!`
              )}
            </motion.div>
          ) : !eligibility?.eligible ? (
            <motion.div key="ineligible" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderInfoState(
                <Clock className="w-10 h-10 text-[#C4975A]" />,
                'Not Eligible Yet',
                `You can review ${vendorName || 'this vendor'} once they've accepted a quote request from you.`
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8"
            >
              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-1 text-center">
                Rate & Review
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-6 text-center">
                Share your experience with {vendorName || 'this vendor'}
              </DialogDescription>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 touch-target"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoverRating || rating) ? 'fill-[#C4975A] text-[#C4975A]' : 'text-[#CDC0B0]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was it like working with this vendor?"
                rows={4}
                className="mb-2 rounded-xl border-[#CDC0B0]/70 bg-white text-[#2C2621] focus-visible:ring-[#C4975A] font-body"
              />
              <p className="text-xs font-body text-[#9C8E82] mb-6 text-right">
                {comment.trim().length}/{MIN_COMMENT_LENGTH} min characters
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl font-body bg-[#C4975A] hover:bg-[#B3874B] text-white shadow-warm-sm disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
