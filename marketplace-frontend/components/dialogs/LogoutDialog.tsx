'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <div className="w-20 h-20 bg-[#FDF2F2] rounded-full flex items-center justify-center mb-6 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                >
                  <LogOut className="w-10 h-10 text-[#B85C5C] ml-1" />
                </motion.div>
                <div className="absolute inset-0 rounded-full border-2 border-[#B85C5C]/20 animate-ping opacity-20"></div>
              </div>
              
              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                Ready to leave?
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-8">
                Are you sure you want to log out of your account? You will need to log back in to access your dashboard.
              </DialogDescription>

              <div className="flex gap-4 w-full">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl font-body border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC] hover:text-[#2C2621]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onConfirm}
                  className="flex-1 h-12 rounded-xl font-body bg-[#B85C5C] hover:bg-[#A04D4D] text-white shadow-warm-sm"
                >
                  Yes, Log Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
