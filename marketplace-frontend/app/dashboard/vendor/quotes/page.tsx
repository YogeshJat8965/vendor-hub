'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, Loader2, FileText, CheckCircle, XCircle, Clock, Send, PackageCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/notifications-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Quote {
  id: string;
  customerEmail: string;
  customerName?: string;
  customerMobile?: string;
  serviceRequested: string;
  projectDescription: string;
  status: string;
  budget?: number;
  preferredDate?: string;
  vendorResponse?: string;
  estimatedCost?: number;
  estimatedTime?: string;
  vendorSlug?: string;
  createdAt: string;
  updatedAt?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'budget-high', label: 'Budget: High to Low' },
  { value: 'budget-low', label: 'Budget: Low to High' },
];

export default function VendorQuotesPage() {
  const { user } = useAuth();
  const { markAllRead } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuotes();
      markAllRead('QUOTE');
    }
  }, [user]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/quotes/vendor?email=${user?.email}`);
      setQuotes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      toast.error('Failed to load quotes');
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter quotes by status
  const filterQuotes = (status: string) => {
    if (status === 'all') return quotes;
    return quotes.filter(q => q.status?.toLowerCase() === status.toLowerCase());
  };

  const filteredQuotes = filterQuotes(activeTab);

  // Search filter
  const searchedQuotes = filteredQuotes.filter(
    q =>
      q.serviceRequested?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort quotes
  const sortedQuotes = [...searchedQuotes].sort((a, b) => {
    if (selectedSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (selectedSort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  const handleRespond = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsResponseDialogOpen(true);
  };

  const handleAccept = async (quoteId: string) => {
    try {
      await apiClient.put(`/quotes/${quoteId}/status`, { status: 'ACCEPTED' });
      toast.success('Quote accepted successfully');
      fetchQuotes();
    } catch (error) {
      console.error('Failed to accept quote:', error);
      toast.error('Failed to accept quote');
    }
  };

  const handleDecline = async (quoteId: string) => {
    try {
      await apiClient.put(`/quotes/${quoteId}/status`, { status: 'REJECTED' });
      toast.success('Quote declined');
      fetchQuotes();
    } catch (error) {
      console.error('Failed to decline quote:', error);
      toast.error('Failed to decline quote');
    }
  };

  const handleMarkDelivered = async (quoteId: string) => {
    try {
      await apiClient.put(`/quotes/${quoteId}/deliver`);
      toast.success('Marked as delivered — waiting on the customer to confirm');
      fetchQuotes();
    } catch (error: any) {
      console.error('Failed to mark quote delivered:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark as delivered');
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedQuote) return;
    
    if (!quoteAmount || !responseMessage) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(`/quotes/${selectedQuote.id}/respond`, {
        estimatedCost: parseFloat(quoteAmount),
        response: responseMessage,
        estimatedTime: '1-2 weeks', // You can add a field for this later
      });
      toast.success('Response sent successfully');
      setIsResponseDialogOpen(false);
      setQuoteAmount('');
      setResponseMessage('');
      setSelectedQuote(null);
      fetchQuotes();
    } catch (error) {
      console.error('Failed to send response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return quotes.length;
    return quotes.filter(q => q.status.toLowerCase() === status.toLowerCase()).length;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-[#EEDDCC] text-[#2C2621]',
      new: 'bg-[#EEDDCC] text-[#2C2621]',
      accepted: 'bg-[#5B8C5A]/20 text-[#5B8C5A]',
      delivered: 'bg-[#5B8CC4]/20 text-[#5B8CC4]',
      disputed: 'bg-[#B85C5C]/20 text-[#B85C5C]',
      completed: 'bg-[#CDB79E] text-[#2C2621]',
      rejected: 'bg-[#B85C5C]/20 text-[#B85C5C]',
    };
    return colors[status.toLowerCase()] || 'bg-[#CDC0B0] text-[#2C2621]';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Quote Requests</h1>
        <p className="text-[#6B5E54] font-body">Manage incoming quote requests from customers</p>
      </div>

      {/* Search & Filter */}
      <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
              <Input
                type="text"
                placeholder="Search by service or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#6B5E54]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#CDC0B0] bg-white font-body text-[#2C2621]">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="focus:bg-[#EEDDCC] focus:text-[#2C2621]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-sm font-body text-[#6B5E54]">
            Showing {sortedQuotes.length} of {quotes.length} quotes
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 bg-[#EEDDCC] rounded-2xl p-1 h-auto gap-1">
          {['all', 'pending', 'accepted', 'delivered', 'disputed', 'completed', 'rejected'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-xl font-body py-2.5 text-xs sm:text-sm data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] text-[#6B5E54] hover:text-[#2C2621]"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getStatusCount(tab)})
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* Quotes List */}
          {sortedQuotes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedQuotes.map((quote, index) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-warm-lg transition-shadow border-[#CDC0B0] bg-white rounded-3xl h-full flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        {/* Quote Header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-heading font-bold text-lg text-[#2C2621] line-clamp-1">{quote.serviceRequested}</h3>
                            <p className="text-sm font-body text-[#6B5E54]">
                              Customer: <span className="font-medium text-[#2C2621]">{quote.customerName || quote.customerEmail}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-body font-medium whitespace-nowrap ${getStatusColor(quote.status)}`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>

                        {/* Quote Description */}
                        <p className="text-sm font-body text-[#6B5E54] line-clamp-2">
                          {quote.projectDescription}
                        </p>

                        {/* Quote Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm font-body">
                          {quote.budget && (
                            <div>
                              <span className="text-[#9C8E82]">Budget:</span>
                              <p className="font-medium text-[#2C2621]">${quote.budget.toLocaleString()}</p>
                            </div>
                          )}
                          {quote.preferredDate && (
                            <div>
                              <span className="text-[#9C8E82]">Preferred Date:</span>
                              <p className="font-medium text-[#2C2621]">{new Date(quote.preferredDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {quote.customerMobile && (
                            <div>
                              <span className="text-[#9C8E82]">Contact:</span>
                              <p className="font-medium text-[#2C2621]">{quote.customerMobile}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-[#9C8E82]">Received:</span>
                            <p className="font-medium text-[#2C2621]">{new Date(quote.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {(quote.status?.toLowerCase() === 'new' || quote.status?.toLowerCase() === 'pending') && (
                        <div className="flex flex-wrap gap-2 pt-6 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] hover:text-white border-none rounded-xl font-body"
                            onClick={() => handleRespond(quote)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#5B8C5A]/30 text-[#5B8C5A] hover:bg-[#5B8C5A]/10 rounded-xl font-body"
                            onClick={() => handleAccept(quote.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#B85C5C]/30 text-[#B85C5C] hover:bg-[#B85C5C]/10 rounded-xl font-body"
                            onClick={() => handleDecline(quote.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {quote.status?.toLowerCase() === 'quoted' && (
                        <div className="flex flex-wrap gap-2 pt-6 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC] rounded-xl font-body"
                            asChild
                          >
                            <Link href={`/dashboard/vendor/inbox?quoteId=${quote.id}`}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#5B8C5A]/30 text-[#5B8C5A] hover:bg-[#5B8C5A]/10 rounded-xl font-body"
                            onClick={() => handleAccept(quote.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#B85C5C]/30 text-[#B85C5C] hover:bg-[#B85C5C]/10 rounded-xl font-body"
                            onClick={() => handleDecline(quote.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {quote.status?.toLowerCase() === 'accepted' && (
                        <div className="flex flex-wrap gap-2 pt-6 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC] rounded-xl font-body"
                            asChild
                          >
                            <Link href={`/dashboard/vendor/inbox?quoteId=${quote.id}`}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#5B8CC4]/30 text-[#5B8CC4] hover:bg-[#5B8CC4]/10 rounded-xl font-body"
                            onClick={() => handleMarkDelivered(quote.id)}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        </div>
                      )}

                      {quote.status?.toLowerCase() === 'delivered' && (
                        <div className="flex flex-wrap gap-2 pt-6 mt-auto items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC] rounded-xl font-body"
                            asChild
                          >
                            <Link href={`/dashboard/vendor/inbox?quoteId=${quote.id}`}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <span className="flex-1 min-w-[calc(50%-0.25rem)] text-center text-sm font-body text-[#9C8E82]">
                            Waiting on customer confirmation
                          </span>
                        </div>
                      )}

                      {quote.status?.toLowerCase() === 'disputed' && (
                        <div className="flex flex-wrap gap-2 pt-6 mt-auto items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC] rounded-xl font-body"
                            asChild
                          >
                            <Link href={`/dashboard/vendor/inbox?quoteId=${quote.id}`}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <span className="flex-1 min-w-[calc(50%-0.25rem)] text-center text-sm font-body text-[#B85C5C]">
                            Disputed — admin is reviewing
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#EEDDCC]/50 border border-[#CDC0B0]/50 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-[#2C2621]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-2">No quote requests found</h3>
                <p className="font-body text-[#6B5E54] max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms to find what you're looking for."
                    : activeTab === 'all'
                    ? "You haven't received any quote requests yet. Keep your profile updated to attract customers."
                    : `You have no ${activeTab} quote requests at the moment.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>

      {/* Quote Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-[#CDC0B0] rounded-3xl p-6 shadow-warm-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-[#2C2621]">Send Quote Response</DialogTitle>
            <DialogDescription className="font-body text-[#6B5E54]">
              Provide your quote amount and additional details for {selectedQuote?.customerEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Quote Amount */}
            <div>
              <Label htmlFor="quote-amount" className="mb-2 font-body text-[#2C2621]">Quote Amount ($)</Label>
              <Input
                id="quote-amount"
                type="number"
                min="0"
                max="10000000"
                placeholder="Enter amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="h-12 w-full max-w-full rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body"
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="mb-2 font-body text-[#2C2621]">Message to Customer</Label>
              <Textarea
                id="message"
                placeholder="Include details about services, timeline, materials, etc."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                maxLength={1000}
                className="min-h-[120px] rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-[#CDC0B0] hover:border-[#9C8E82] text-[#2C2621] font-body"
                onClick={() => setIsResponseDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[#C4975A] hover:bg-[#B38549] text-white border-none font-body"
                onClick={handleSubmitQuote}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Quote'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
