'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorSlug: string;
  vendorName: string;
}

export function QuoteRequestDialog({
  open,
  onOpenChange,
  vendorSlug,
  vendorName,
}: QuoteRequestDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    budget: '',
    timeline: '',
    contactPhone: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      toast.error('Please login to request a quote');
      router.push('/login');
      return;
    }

    // Validate form
    if (!formData.serviceType || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const quoteData = {
        vendorSlug,
        customerEmail: user.email,
        serviceType: formData.serviceType,
        description: formData.description,
        budget: formData.budget || 'Not specified',
        timeline: formData.timeline || 'Flexible',
        contactPhone: formData.contactPhone || user.email,
        location: formData.location,
        status: 'PENDING',
      };

      await apiClient.post('/quotes/request', quoteData);

      toast.success('Quote request sent successfully!');
      
      // Reset form
      setFormData({
        serviceType: '',
        description: '',
        budget: '',
        timeline: '',
        contactPhone: '',
        location: '',
      });

      // Close dialog
      onOpenChange(false);

      // Redirect to quotes page
      setTimeout(() => {
        router.push('/dashboard/customer/quotes');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to submit quote request:', error);
      toast.error(error.response?.data?.message || 'Failed to send quote request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Request a Quote
          </DialogTitle>
          <DialogDescription>
            Get a personalized quote from {vendorName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-sm font-medium">
              Service Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serviceType"
              name="serviceType"
              placeholder="e.g., Plumbing repair, Kitchen renovation"
              value={formData.serviceType}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="touch-target"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Project Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project requirements in detail..."
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be as specific as possible to get an accurate quote
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">
              Estimated Budget (Optional)
            </Label>
            <Input
              id="budget"
              name="budget"
              placeholder="e.g., $500-$1000"
              value={formData.budget}
              onChange={handleChange}
              disabled={isSubmitting}
              className="touch-target"
            />
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              Preferred Timeline (Optional)
            </Label>
            <Input
              id="timeline"
              name="timeline"
              placeholder="e.g., Within 2 weeks, ASAP"
              value={formData.timeline}
              onChange={handleChange}
              disabled={isSubmitting}
              className="touch-target"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-sm font-medium">
              Contact Phone (Optional)
            </Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={formData.contactPhone}
              onChange={handleChange}
              disabled={isSubmitting}
              className="touch-target"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Service Location (Optional)
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., 123 Main St, New York, NY"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
              className="touch-target"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 touch-target"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
