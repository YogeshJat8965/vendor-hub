'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Filter, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  service: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    rating: 5,
    date: '2024-01-15',
    comment: 'Excellent service! Very professional and completed the job quickly. Highly recommend!',
    service: 'Emergency Plumbing',
  },
  {
    id: '2',
    customerName: 'Mike Williams',
    rating: 5,
    date: '2024-01-10',
    comment: 'Great work on installing my new water heater. Fair pricing and quality work.',
    service: 'Water Heater Installation',
  },
  {
    id: '3',
    customerName: 'Emily Chen',
    rating: 4,
    date: '2024-01-05',
    comment: 'Good service overall. Arrived on time and fixed the issue. Would use again.',
    service: 'Bathroom Repair',
  },
  {
    id: '4',
    customerName: 'David Brown',
    rating: 5,
    date: '2023-12-28',
    comment: 'Outstanding! Fixed my leak quickly and cleaned up everything. Very satisfied.',
    service: 'Leak Repair',
  },
  {
    id: '5',
    customerName: 'Lisa Anderson',
    rating: 3,
    date: '2023-12-20',
    comment: 'Service was okay. Got the job done but took longer than expected.',
    service: 'Pipe Replacement',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (star) => (reviews.filter((r) => r.rating === star).length / totalReviews) * 100
  );

  // Filtered and sorted reviews
  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Reviews</h1>
        <p className="text-gray-600">Customer feedback and ratings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-gray-600">{totalReviews} total reviews</p>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star, index) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                      style={{ width: `${ratingDistribution[index]}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(ratingDistribution[index])}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 touch-target"
              />
            </div>

            {/* Rating Filter */}
            <Tabs value={ratingFilter} onValueChange={setRatingFilter} className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="5">5★</TabsTrigger>
                <TabsTrigger value="4">4★</TabsTrigger>
                <TabsTrigger value="3">3★</TabsTrigger>
                <TabsTrigger value="2">2★</TabsTrigger>
                <TabsTrigger value="1">1★</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredReviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="bg-transparent text-white">
                        {review.customerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold">{review.customerName}</h3>
                          <p className="text-sm text-gray-600">{review.service}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
