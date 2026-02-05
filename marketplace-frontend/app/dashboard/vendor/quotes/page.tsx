'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { IncomingQuoteCard } from '@/components/cards/IncomingQuoteCard';
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

// Mock data - will be replaced with API
const mockQuotes = [
  {
    id: '1',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(555) 123-4567',
      location: 'Manhattan, NY',
    },
    service: 'Emergency Plumbing Repair',
    description: 'Leaking pipe in basement causing water damage. Need immediate assistance.',
    preferredDate: 'ASAP',
    budget: 500,
    createdAt: '2024-01-20T10:30:00',
    status: 'pending' as const,
  },
  {
    id: '2',
    customer: {
      name: 'Mike Williams',
      email: 'mike@example.com',
      phone: '(555) 234-5678',
      location: 'Brooklyn, NY',
    },
    service: 'Water Heater Installation',
    description: 'Need to replace old water heater with new energy-efficient model.',
    preferredDate: 'Jan 25-27',
    budget: 1200,
    createdAt: '2024-01-19T14:20:00',
    status: 'pending' as const,
  },
  {
    id: '3',
    customer: {
      name: 'Emily Chen',
      email: 'emily@example.com',
      phone: '(555) 345-6789',
      location: 'Queens, NY',
    },
    service: 'Bathroom Fixture Repair',
    description: 'Fix leaking faucet and replace toilet flush mechanism.',
    createdAt: '2024-01-18T09:15:00',
    status: 'responded' as const,
  },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'budget-high', label: 'Budget: High to Low' },
  { value: 'budget-low', label: 'Budget: Low to High' },
];

export default function VendorQuotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

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
      q.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRespond = (quoteId: string) => {
    setSelectedQuote(quoteId);
    setIsResponseDialogOpen(true);
    // TODO: Load quote details
  };

  const handleAccept = (quoteId: string) => {
    // TODO: Call API to accept quote
    console.log('Accept quote:', quoteId);
  };

  const handleDecline = (quoteId: string) => {
    // TODO: Call API to decline quote
    console.log('Decline quote:', quoteId);
  };

  const handleSubmitQuote = () => {
    // TODO: Call API to send quote response
    console.log('Submit quote:', { quoteAmount, responseMessage });
    setIsResponseDialogOpen(false);
    setQuoteAmount('');
    setResponseMessage('');
  };

  const statusCounts = {
    all: mockQuotes.length,
    pending: mockQuotes.filter(q => q.status === 'pending').length,
    responded: mockQuotes.filter(q => q.status === 'responded').length,
    accepted: mockQuotes.filter(q => q.status === 'accepted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Quote Requests</h1>
        <p className="text-gray-600">Manage incoming quote requests from customers</p>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by service or customer..."
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
          <TabsTrigger value="responded" className="touch-target">
            Responded ({statusCounts.responded})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="touch-target">
            Accepted ({statusCounts.accepted})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Quotes List */}
          {searchedQuotes.length > 0 ? (
            <div className="space-y-6">
              {searchedQuotes.map((quote, index) => (
                <IncomingQuoteCard
                  key={quote.id}
                  quote={quote}
                  onRespond={handleRespond}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
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
                <h3 className="text-xl font-bold mb-2">No quote requests found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : activeTab === 'all'
                    ? "You haven't received any quote requests yet"
                    : `You have no ${activeTab} quote requests`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>

      {/* Quote Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Quote Response</DialogTitle>
            <DialogDescription>
              Provide your quote amount and additional details for the customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Quote Amount */}
            <div>
              <Label htmlFor="quote-amount" className="mb-2">Quote Amount ($)</Label>
              <Input
                id="quote-amount"
                type="number"
                placeholder="Enter amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="h-12 touch-target"
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="mb-2">Message to Customer</Label>
              <Textarea
                id="message"
                placeholder="Include details about services, timeline, materials, etc."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="min-h-32 touch-target"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 touch-target"
                onClick={() => setIsResponseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
                onClick={handleSubmitQuote}
              >
                Send Quote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
