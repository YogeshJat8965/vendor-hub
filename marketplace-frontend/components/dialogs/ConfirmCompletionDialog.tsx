'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequested: string;
  onConfirm: () => Promise<void>;
}

/**
 * The customer's side of the delivery handoff: the vendor has marked the
 * project delivered, and this is the final "yes, I actually received it"
 * checkpoint before the quote is allowed to become Completed and eligible
 * for a review.
 */
export function ConfirmCompletionDialog({ isOpen, onClose, serviceRequested, onConfirm }: ConfirmCompletionDialogProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !confirming && onClose()}>
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
              <div className="w-20 h-20 bg-[#F0F4EA] rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#8A9A5B]" />
              </div>

              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                Confirm Completion
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-8">
                Has <span className="font-semibold text-[#2C2621]">{serviceRequested}</span> been delivered to your
                satisfaction? Confirming will mark this project as completed and unlock your review.
              </DialogDescription>

              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={confirming}
                  className="flex-1 h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  Not Yet
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 h-12 rounded-xl font-body bg-[#8A9A5B] hover:bg-[#79884E] text-white shadow-warm-sm disabled:opacity-70"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Yes, Mark Complete'
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
