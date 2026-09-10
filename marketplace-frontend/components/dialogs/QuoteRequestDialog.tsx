'use client';

import { useState, useEffect } from 'react';
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
  catalogueId?: string;
  catalogueItemId?: string;
  initialServiceType?: string;
  initialDescription?: string;
}

export function QuoteRequestDialog({
  open,
  onOpenChange,
  vendorSlug,
  vendorName,
  catalogueId,
  catalogueItemId,
  initialServiceType,
  initialDescription,
}: QuoteRequestDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: initialServiceType || '',
    description: initialDescription || '',
    budget: '',
    timeline: '',
    contactPhone: '',
    location: '',
  });

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        serviceType: initialServiceType || prev.serviceType,
        description: initialDescription || prev.description,
      }));
    }
  }, [open, initialServiceType, initialDescription]);

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

      // Convert budget string to a number for the backend
      let parsedBudget = null;
      if (formData.budget) {
        const num = parseFloat(formData.budget.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) parsedBudget = num;
      }

      // Combine location and timeline into the description since backend doesn't have dedicated fields for them
      const fullDescription = `${formData.description}
${formData.location ? `\nLocation: ${formData.location}` : ''}
${formData.timeline ? `\nTimeline: ${formData.timeline}` : ''}`;

      const quoteData = {
        vendorSlug,
        customerName: user.name || user.email.split('@')[0],
        customerEmail: user.email,
        customerMobile: formData.contactPhone || '',
        serviceRequested: formData.serviceType,
        projectDescription: fullDescription.trim(),
        budget: parsedBudget,
        status: 'NEW',
        catalogueId: catalogueId,
        catalogueItemId: catalogueItemId,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#FDFBF7] border-[#CDC0B0] sm:rounded-3xl shadow-warm-xl p-0">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            >
              <DialogHeader className="p-6 pb-4 border-b border-[#CDC0B0]/50 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm z-10">
                <DialogTitle className="text-2xl font-heading font-bold text-[#2C2621]">
                  Request a Quote
                </DialogTitle>
                <DialogDescription className="font-body text-[#6B5E54] mt-1">
                  Get a personalized quote from {vendorName}
                </DialogDescription>
              </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-sm font-heading font-bold text-[#2C2621]">
              Service Type <span className="text-[#B85C5C]">*</span>
            </Label>
            <Input
              id="serviceType"
              name="serviceType"
              placeholder="e.g., Plumbing repair, Kitchen renovation"
              value={formData.serviceType}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="touch-target border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl h-12"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-heading font-bold text-[#2C2621]">
              Project Description <span className="text-[#B85C5C]">*</span>
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
              className="resize-none border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl p-4"
            />
            <p className="text-xs font-body text-[#9C8E82]">
              Be as specific as possible to get an accurate quote
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-heading font-bold text-[#2C2621]">
                Estimated Budget <span className="text-[#9C8E82] font-normal text-xs">(Optional)</span>
              </Label>
              <Input
                id="budget"
                name="budget"
                placeholder="e.g., $500-$1000"
                value={formData.budget}
                onChange={handleChange}
                disabled={isSubmitting}
                className="touch-target border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl h-12"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-sm font-heading font-bold text-[#2C2621]">
                Preferred Timeline <span className="text-[#9C8E82] font-normal text-xs">(Optional)</span>
              </Label>
              <Input
                id="timeline"
                name="timeline"
                placeholder="e.g., Within 2 weeks"
                value={formData.timeline}
                onChange={handleChange}
                disabled={isSubmitting}
                className="touch-target border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl h-12"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-heading font-bold text-[#2C2621]">
                Contact Phone <span className="text-[#9C8E82] font-normal text-xs">(Optional)</span>
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="e.g., (555) 123-4567"
                value={formData.contactPhone}
                onChange={handleChange}
                disabled={isSubmitting}
                className="touch-target border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl h-12"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-heading font-bold text-[#2C2621]">
                Service Location <span className="text-[#9C8E82] font-normal text-xs">(Optional)</span>
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., 123 Main St, New York"
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
                className="touch-target border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body bg-white rounded-xl h-12"
              />
            </div>
          </div>

          <div className="h-px w-full bg-[#CDC0B0]/50 my-2" />

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 touch-target bg-white border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body rounded-xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl touch-target font-body h-12 shadow-warm-sm"
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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
