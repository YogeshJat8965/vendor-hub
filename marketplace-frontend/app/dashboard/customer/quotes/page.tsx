'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X, Loader2, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteDetailDialog } from '@/components/dialogs/QuoteDetailDialog';
import { WriteReviewDialog } from '@/components/dialogs/WriteReviewDialog';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import Link from 'next/link';

interface Quote {
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
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
];

export default function CustomerQuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [reviewingQuote, setReviewingQuote] = useState<Quote | null>(null);
  const [reviewedVendorSlugs, setReviewedVendorSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/quotes/customer?email=${user?.email}`);
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
    return quotes.filter(q => q.status.toLowerCase() === status.toLowerCase());
  };

  const filteredQuotes = filterQuotes(activeTab);

  // Search filter
  const searchedQuotes = filteredQuotes.filter(
    q => 
      q.serviceRequested?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorSlug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort quotes
  const sortedQuotes = [...searchedQuotes].sort((a, b) => {
    if (selectedSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (selectedSort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (selectedSort === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  const getStatusCount = (status: string) => {
    if (status === 'all') return quotes.length;
    return quotes.filter(q => q.status.toLowerCase() === status.toLowerCase()).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#CDC0B0]/30 border-t-[#C4975A] rounded-full animate-spin" />
          <p className="font-heading font-medium text-[#9C8E82] tracking-widest uppercase text-sm animate-pulse">
            Loading Quotes
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">My Quotes</h1>
          <p className="text-[#6B5E54] font-body">Manage and track all your quote requests</p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                <Input
                  type="text"
                  placeholder="Search quotes or vendors..."
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
          <TabsList className="grid w-full grid-cols-5 bg-[#EEDDCC] rounded-2xl p-1 h-auto">
            {['all', 'pending', 'accepted', 'completed', 'rejected'].map(tab => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="rounded-xl font-body py-2.5 data-[state=active]:bg-[#2C2621] data-[state=active]:text-[#EEDDCC] text-[#6B5E54] hover:text-[#2C2621]"
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
                                Professional: <span className="font-medium text-[#2C2621]">{quote.vendorSlug}</span>
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
                                <p className="font-medium text-[#2C2621]">${quote.budget}</p>
                              </div>
                            )}
                            {quote.timeline && (
                              <div>
                                <span className="text-[#9C8E82]">Timeline:</span>
                                <p className="font-medium text-[#2C2621]">{quote.timeline}</p>
                              </div>
                            )}
                            {quote.location && (
                              <div>
                                <span className="text-[#9C8E82]">Location:</span>
                                <p className="font-medium text-[#2C2621] line-clamp-1">{quote.location}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-[#9C8E82]">Submitted:</span>
                              <p className="font-medium text-[#2C2621]">{new Date(quote.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-6 mt-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] text-[#2C2621] rounded-xl font-body"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] text-[#2C2621] rounded-xl font-body"
                            asChild
                          >
                            <Link href={`/vendors/${quote.vendorSlug}`}>
                              View Profile
                            </Link>
                          </Button>
                          {quote.status.toLowerCase() === 'accepted' && (
                            <Button
                              variant="outline"
                              disabled={reviewedVendorSlugs.has(quote.vendorSlug)}
                              className="border-[#C4975A]/60 text-[#C4975A] hover:bg-[#C4975A]/10 rounded-xl font-body disabled:opacity-60"
                              onClick={() => setReviewingQuote(quote)}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {reviewedVendorSlugs.has(quote.vendorSlug) ? 'Reviewed' : 'Rate & Review'}
                            </Button>
                          )}
                        </div>
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
                  <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-2">No quotes found</h3>
                  <p className="font-body text-[#6B5E54] mb-8 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search terms to find what you're looking for."
                      : activeTab === 'all'
                      ? "You haven't requested any quotes yet. Start exploring professionals to begin your project."
                      : `You have no ${activeTab} quotes at the moment.`}
                  </p>
                  {!searchQuery && activeTab === 'all' && (
                    <Button
                      size="lg"
                      className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] rounded-xl font-body px-8"
                      asChild
                    >
                      <Link href="/explore">
                        Explore Professionals
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>

        {/* Quote Detail Dialog */}
        <QuoteDetailDialog
          quote={selectedQuote}
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />

        {/* Rate & Review Dialog */}
        {reviewingQuote && (
          <WriteReviewDialog
            isOpen={!!reviewingQuote}
            onClose={() => setReviewingQuote(null)}
            vendorSlug={reviewingQuote.vendorSlug}
            vendorName={reviewingQuote.vendorSlug}
            onSubmitted={() => {
              setReviewedVendorSlugs(prev => new Set(prev).add(reviewingQuote.vendorSlug));
            }}
          />
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-[#EEDDCC] text-[#2C2621]',
    accepted: 'bg-[#5B8C5A]/20 text-[#5B8C5A]',
    completed: 'bg-[#CDB79E] text-[#2C2621]',
    rejected: 'bg-[#B85C5C]/20 text-[#B85C5C]',
  };
  return colors[status.toLowerCase()] || 'bg-[#CDC0B0] text-[#2C2621]';
}
