'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DisputeDeliveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequested: string;
  onSubmit: (reason: string) => Promise<void>;
}

const MIN_REASON_LENGTH = 10;

/**
 * The customer's alternative to Confirm Completion: instead of confirming,
 * they explain what went wrong and it gets escalated to admin. Raising a
 * dispute takes the quote out of DELIVERED entirely, which is what stops
 * the 7-day auto-complete safety net from ever silently closing it out
 * against the customer's word.
 */
export function DisputeDeliveryDialog({ isOpen, onClose, serviceRequested, onSubmit }: DisputeDeliveryDialogProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setReason('');
    onClose();
  };

  const handleSubmit = async () => {
    if (reason.trim().length < MIN_REASON_LENGTH) return;
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-[#CDC0B0]/50 rounded-3xl" showCloseButton={false}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#FDF2F2] rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-[#B85C5C]" />
              </div>

              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                Report an Issue
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-6">
                Tell us what went wrong with <span className="font-semibold text-[#2C2621]">{serviceRequested}</span>.
                An admin will review this and follow up — it won&apos;t auto-complete while under review.
              </DialogDescription>

              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. the work wasn't finished, the product arrived damaged, it doesn't match what was agreed..."
                rows={4}
                maxLength={1000}
                className="mb-2 rounded-xl border-[#CDC0B0]/70 bg-white text-[#2C2621] focus-visible:ring-[#B85C5C] font-body text-left"
              />
              <p className="text-xs font-body text-[#9C8E82] mb-6 text-right w-full">
                {reason.trim().length}/{MIN_REASON_LENGTH} min characters
              </p>

              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || reason.trim().length < MIN_REASON_LENGTH}
                  className="flex-1 h-12 rounded-xl font-body bg-[#B85C5C] hover:bg-[#A04D4D] text-white shadow-warm-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
