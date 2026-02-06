'use client';

import { useState } from 'react';
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{quote.serviceRequested}</DialogTitle>
              <Badge className={getStatusColor(quote.status)}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quote Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {quote.projectDescription}
            </p>
          </div>

          <Separator />

          {/* Quote Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Vendor
              </h3>
              <Link 
                href={`/vendors/${quote.vendorSlug}`}
                className="text-blue-600 hover:underline"
              >
                {quote.vendorSlug}
              </Link>
            </div>

            {/* Budget */}
            {quote.budget && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{quote.budget}</p>
              </div>
            )}

            {/* Timeline */}
            {quote.timeline && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{quote.timeline}</p>
              </div>
            )}

            {/* Location */}
            {quote.location && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{quote.location}</p>
              </div>
            )}

            {/* Contact Phone */}
            {quote.customerMobile && (
              <div>
                <h3 className="font-semibold mb-2">Contact Phone</h3>
                <p className="text-gray-700 dark:text-gray-300">{quote.customerMobile}</p>
              </div>
            )}

            {/* Created Date */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Submitted
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
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
                <h3 className="font-semibold mb-2">Last Updated</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(quote.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/vendors/${quote.vendorSlug}`}>
                View Vendor Profile
              </Link>
            </Button>
            {quote.status.toLowerCase() === 'pending' && (
              <Button
                variant="destructive"
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
      </DialogContent>
    </Dialog>
  );
}
