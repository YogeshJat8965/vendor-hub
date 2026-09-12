'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface FlagReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string | null;
  onFlagged?: () => void;
}

const FLAG_REASONS = [
  { value: 'FAKE', label: "Fake — not a real customer" },
  { value: 'OFFENSIVE', label: 'Offensive language' },
  { value: 'SPAM', label: 'Spam / irrelevant' },
  { value: 'COMPETITOR', label: 'Suspected competitor' },
  { value: 'OTHER', label: 'Other' },
];

export function FlagReviewDialog({ isOpen, onClose, reviewId, onFlagged }: FlagReviewDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason('');
    setDetails('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reviewId) return;
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.put(`/reviews/${reviewId}/flag`, { reason, details: details.trim() || undefined });
      toast.success('Review flagged for admin review');
      onFlagged?.();
      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to flag review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-[#CDC0B0]/50 rounded-3xl" showCloseButton={true}>
        <div className="p-8">
          <div className="w-16 h-16 bg-[#F2ECE4] rounded-full flex items-center justify-center mb-5 mx-auto">
            <Flag className="w-7 h-7 text-[#C4975A]" />
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-[#2C2621] mb-1 text-center">
            Flag This Review
          </DialogTitle>
          <DialogDescription className="font-body text-[#6B5E54] text-sm mb-6 text-center px-2">
            It will stay visible, tagged as under review, but won&apos;t count toward your rating while an admin
            looks into it.
          </DialogDescription>

          <label className="text-xs font-body font-bold uppercase tracking-wider text-[#2C2621] mb-2 block">
            Reason
          </label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full h-12 rounded-xl border-[#CDC0B0] bg-white font-body text-[#2C2621] mb-4">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#CDC0B0] rounded-xl">
              {FLAG_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value} className="font-body focus:bg-[#EEDDCC]/50 focus:text-[#2C2621]">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="text-xs font-body font-bold uppercase tracking-wider text-[#2C2621] mb-2 block">
            Details (optional)
          </label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Anything that helps admin understand the situation..."
            rows={3}
            className="mb-6 rounded-xl border-[#CDC0B0]/70 bg-white text-[#2C2621] focus-visible:ring-[#C4975A] font-body"
          />

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 rounded-xl font-body bg-[#C4975A] hover:bg-[#B3874B] text-white shadow-warm-sm disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Flagging...
                </>
              ) : (
                'Flag Review'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="w-full h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
