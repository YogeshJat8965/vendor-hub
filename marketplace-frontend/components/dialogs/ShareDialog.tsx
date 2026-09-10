'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function ShareDialog({ isOpen, onClose, url, title = 'Share this page' }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = url || (typeof window !== 'undefined' ? window.location.href : '');
    if (!textToCopy) return;

    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      }
    } catch (err) {
      console.warn('navigator.clipboard failed, using fallback:', err);
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
    }

    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link. Please copy it manually.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-[#CDC0B0]/50 rounded-3xl" showCloseButton={true}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#F2ECE4] rounded-full flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                >
                  <Share2 className="w-8 h-8 text-[#C4975A]" />
                </motion.div>
              </div>
              
              <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-2">
                {title}
              </DialogTitle>
              <DialogDescription className="font-body text-[#6B5E54] text-base mb-6 px-4">
                Copy the link below to share with others.
              </DialogDescription>

              <div className="flex w-full items-center space-x-2">
                <Input
                  value={url}
                  readOnly
                  className="flex-1 font-body bg-white border-[#CDC0B0] text-[#6B5E54] rounded-xl h-12 focus-visible:ring-[#CDB79E]"
                />
                <Button 
                  onClick={handleCopy}
                  className={`h-12 px-6 rounded-xl font-body text-white transition-all duration-300 ${
                    copied ? 'bg-green-600 hover:bg-green-700' : 'bg-[#C4975A] hover:bg-[#B3874B]'
                  }`}
                >
                  {copied ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied
                    </motion.div>
                  ) : (
                    <div className="flex items-center">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </div>
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
