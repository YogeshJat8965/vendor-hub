'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthRequiredDialog({ isOpen, onClose, message = 'Please log in to continue.' }: AuthRequiredDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  <Lock className="w-10 h-10 text-[#C4975A]" />
                </motion.div>
              </div>
              
              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                Authentication Required
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-8 px-4">
                {message}
              </DialogDescription>

              <div className="flex flex-col w-full gap-3">
                <Button 
                  asChild
                  className="w-full h-12 rounded-xl font-body bg-[#C4975A] hover:bg-[#B3874B] text-white shadow-warm-sm"
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In Now
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="w-full h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  <Link href="/signup">
                    Create an Account
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
