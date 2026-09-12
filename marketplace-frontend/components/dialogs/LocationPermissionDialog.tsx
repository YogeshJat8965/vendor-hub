'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LocationPermissionDialogProps {
  isOpen: boolean;
  isLocating: boolean;
  onShare: () => void;
  onDismiss: () => void;
}

export function LocationPermissionDialog({ isOpen, isLocating, onShare, onDismiss }: LocationPermissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-[#CDC0B0]/50 rounded-3xl" showCloseButton={true}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#F2ECE4] rounded-full flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                >
                  <LocateFixed className="w-10 h-10 text-[#C4975A]" />
                </motion.div>
              </div>

              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                Find Vendors Near You
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-8 px-2">
                Share your location and we&apos;ll show design partners in your city first, so you find the right one faster.
              </DialogDescription>

              <div className="flex flex-col w-full gap-3">
                <Button
                  onClick={onShare}
                  disabled={isLocating}
                  className="w-full h-12 rounded-xl font-body bg-[#C4975A] hover:bg-[#B3874B] text-white shadow-warm-sm disabled:opacity-70"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Detecting your location...
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-4 h-4 mr-2" />
                      Share My Location
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  disabled={isLocating}
                  className="w-full h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  Not Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
