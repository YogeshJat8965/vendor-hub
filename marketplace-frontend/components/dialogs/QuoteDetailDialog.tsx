'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, MapPin, Clock, FileText, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface QuoteDetailDialogProps {
  quote: {
    id: string;
    vendorSlug: string;
    customerName?: string;
    customerEmail: string;
    customerMobile?: string;
    serviceRequested: string;
    projectDescription: string;
    status: string;
    budget?: number;
    preferredDate?: string;
    timeline?: string;
    location?: string;
    vendorResponse?: string;
    estimatedCost?: number;
    estimatedTime?: string;
    createdAt: string;
    updatedAt?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteDetailDialog({ quote, isOpen, onClose }: QuoteDetailDialogProps) {
  if (!quote) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-[#FEF3C7] text-[#D97706]',
      accepted: 'bg-[#F4F6F0] text-[#8A9A5B]',
      completed: 'bg-[#FDFBF7] border-[#C4975A] text-[#C4975A]',
      rejected: 'bg-[#FDF2F2] text-[#B85C5C]',
    };
    return colors[status.toLowerCase()] || 'bg-[#EEDDCC]/50 text-[#6B5E54]';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] border-[#CDC0B0] sm:rounded-3xl shadow-warm-xl p-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            >
              <DialogHeader className="p-6 border-b border-[#CDC0B0]/50 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621] mb-3">{quote.serviceRequested}</DialogTitle>
                    <Badge className={`${getStatusColor(quote.status)} border-0 font-body font-medium px-3 py-1`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Quote Description */}
          <div>
            <h3 className="font-heading font-bold text-[#2C2621] mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#C4975A]" />
              Description
            </h3>
            <p className="font-body text-[#6B5E54] bg-white border border-[#CDC0B0]/30 p-5 rounded-2xl leading-relaxed">
              {quote.projectDescription}
            </p>
          </div>

          <div className="h-px w-full bg-[#CDC0B0]/50" />

          {/* Quote Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
            {/* Vendor */}
            <div>
              <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Vendor
              </h3>
              <Link 
                href={`/vendors/${quote.vendorSlug}`}
                className="font-heading font-medium text-[#C4975A] hover:text-[#B38549] text-lg transition-colors"
              >
                {quote.vendorSlug}
              </Link>
            </div>

            {/* Budget */}
            {quote.budget && (
              <div>
                <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget
                </h3>
                <p className="font-heading font-medium text-[#2C2621] text-lg">${quote.budget.toLocaleString()}</p>
              </div>
            )}

            {/* Timeline */}
            {quote.timeline && (
              <div>
                <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline
                </h3>
                <p className="font-heading font-medium text-[#2C2621] text-lg">{quote.timeline}</p>
              </div>
            )}

            {/* Location */}
            {quote.location && (
              <div>
                <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </h3>
                <p className="font-heading font-medium text-[#2C2621] text-lg">{quote.location}</p>
              </div>
            )}

            {/* Contact Phone */}
            {quote.customerMobile && (
              <div>
                <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2">Contact Phone</h3>
                <p className="font-heading font-medium text-[#2C2621] text-lg">{quote.customerMobile}</p>
              </div>
            )}

            {/* Created Date */}
            <div>
              <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Submitted
              </h3>
              <p className="font-heading font-medium text-[#2C2621] text-lg">
                {new Date(quote.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Updated Date */}
            {quote.updatedAt && (
              <div>
                <h3 className="font-heading font-bold text-[#9C8E82] text-sm uppercase tracking-wider mb-2">Last Updated</h3>
                <p className="font-heading font-medium text-[#2C2621] text-lg">
                  {new Date(quote.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-[#CDC0B0]/50" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 bg-white border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body rounded-xl h-12"
              asChild
            >
              <Link href={`/vendors/${quote.vendorSlug}`}>
                View Vendor Profile
              </Link>
            </Button>
            {quote.status.toLowerCase() === 'pending' && (
              <Button
                variant="outline"
                className="flex-1 bg-white border-[#B85C5C] text-[#B85C5C] hover:bg-[#FDF2F2] hover:text-[#B85C5C] font-body rounded-xl h-12"
                onClick={() => {
                  // TODO: Implement cancel quote
                  console.log('Cancel quote:', quote.id);
                }}
              >
                Cancel Quote
              </Button>
            )}
          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
