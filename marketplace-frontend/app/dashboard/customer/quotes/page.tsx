'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteDetailDialog } from '@/components/dialogs/QuoteDetailDialog';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Quotes</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all your quote requests</p>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search quotes or vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {sortedQuotes.length} of {quotes.length} quotes
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({getStatusCount('all')})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({getStatusCount('pending')})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({getStatusCount('accepted')})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getStatusCount('completed')})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({getStatusCount('rejected')})
            </TabsTrigger>
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
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Quote Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{quote.serviceRequested}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vendor: {quote.vendorSlug}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </div>

                          {/* Quote Description */}
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {quote.projectDescription}
                          </p>

                          {/* Quote Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {quote.budget && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                                <p className="font-medium">{quote.budget}</p>
                              </div>
                            )}
                            {quote.timeline && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                                <p className="font-medium">{quote.timeline}</p>
                              </div>
                            )}
                            {quote.location && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <p className="font-medium">{quote.location}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                              <p className="font-medium">{new Date(quote.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedQuote(quote)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline"
                              asChild
                            >
                              <Link href={`/vendors/${quote.vendorSlug}`}>
                                View Vendor
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No quotes found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : activeTab === 'all'
                      ? "You haven't requested any quotes yet"
                      : `You have no ${activeTab} quotes`}
                  </p>
                  {!searchQuery && activeTab === 'all' && (
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      asChild
                    >
                      <Link href="/explore">
                        Explore Vendors
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
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
