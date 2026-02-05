'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import { QuoteCard } from '@/components/cards/QuoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// Mock data - will be replaced with API
const mockQuotes = [
  {
    id: '1',
    vendor: {
      id: 'v1',
      name: 'Johns Plumbing Services',
      city: 'New York',
      state: 'NY',
    },
    service: 'Emergency Plumbing Repair',
    description: 'Need urgent repair for leaking pipe in basement. Water damage is spreading.',
    status: 'accepted' as const,
    amount: 450,
    createdAt: '2024-01-15',
    respondedAt: '2024-01-15',
  },
  {
    id: '2',
    vendor: {
      id: 'v2',
      name: 'Elite Electrical Solutions',
      city: 'Los Angeles',
      state: 'CA',
    },
    service: 'Electrical Outlet Installation',
    description: 'Install 4 new electrical outlets in home office and living room.',
    status: 'pending' as const,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    vendor: {
      id: 'v3',
      name: 'Perfect Painting Co',
      city: 'Chicago',
      state: 'IL',
    },
    service: 'Interior Wall Painting',
    description: 'Paint 2 bedrooms and 1 living room. Walls are in good condition.',
    status: 'completed' as const,
    amount: 1200,
    createdAt: '2024-01-05',
    respondedAt: '2024-01-06',
    completedAt: '2024-01-12',
  },
  {
    id: '4',
    vendor: {
      id: 'v4',
      name: 'Green Thumb Landscaping',
      city: 'Houston',
      state: 'TX',
    },
    service: 'Garden Maintenance',
    description: 'Monthly lawn mowing, trimming, and basic garden maintenance.',
    status: 'rejected' as const,
    createdAt: '2024-01-18',
    respondedAt: '2024-01-19',
  },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount-high', label: 'Amount: High to Low' },
  { value: 'amount-low', label: 'Amount: Low to High' },
];

export default function CustomerQuotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  // Filter quotes by status
  const filterQuotes = (status: string) => {
    if (status === 'all') return mockQuotes;
    return mockQuotes.filter(q => q.status === status);
  };

  const filteredQuotes = filterQuotes(activeTab);

  // Search filter
  const searchedQuotes = filteredQuotes.filter(
    q => 
      q.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (quoteId: string) => {
    setSelectedQuote(quoteId);
    // TODO: Open quote details dialog
    console.log('View quote details:', quoteId);
  };

  const statusCounts = {
    all: mockQuotes.length,
    pending: mockQuotes.filter(q => q.status === 'pending').length,
    accepted: mockQuotes.filter(q => q.status === 'accepted').length,
    completed: mockQuotes.filter(q => q.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Quotes</h1>
        <p className="text-gray-600">Manage and track all your quote requests</p>
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
                className="pl-10 h-12 touch-target"
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
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="touch-target">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 touch-target">
          <TabsTrigger value="all" className="touch-target">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="touch-target">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="touch-target">
            Accepted ({statusCounts.accepted})
          </TabsTrigger>
          <TabsTrigger value="completed" className="touch-target">
            Completed ({statusCounts.completed})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Quotes List */}
          {searchedQuotes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchedQuotes.map((quote, index) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onViewDetails={handleViewDetails}
                  index={index}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No quotes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : activeTab === 'all'
                    ? "You haven't requested any quotes yet"
                    : `You have no ${activeTab} quotes`}
                </p>
                {!searchQuery && activeTab === 'all' && (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
                    onClick={() => window.location.href = '/explore'}
                  >
                    Explore Vendors
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>

      {/* Pagination Placeholder */}
      {searchedQuotes.length > 6 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="outline" className="bg-blue-600 text-white">
            1
          </Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      )}
    </div>
  );
}
