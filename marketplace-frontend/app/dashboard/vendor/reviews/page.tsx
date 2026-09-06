'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  serviceType: string;
}

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
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/reviews/vendor?email=${user?.email}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (star) => totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0
  );

  // Filtered and sorted reviews
  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
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
              star <= rating ? 'fill-[#C4975A] text-[#C4975A]' : 'text-[#CDC0B0]'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Reviews</h1>
          <p className="text-[#6B5E54] font-body">Customer feedback and ratings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Rating */}
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm flex flex-col items-center justify-center">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full w-full">
              <div className="text-center w-full">
                <div className="text-6xl font-heading font-bold text-[#2C2621] mb-4">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-3 scale-125">{renderStars(Math.round(averageRating))}</div>
                <p className="text-[#6B5E54] font-body text-sm mt-4">{totalReviews} total reviews</p>
              </div>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="lg:col-span-2 border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardContent className="p-8 h-full flex flex-col justify-center">
              <h3 className="font-heading font-bold text-[#2C2621] text-xl mb-6">Rating Distribution</h3>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star, index) => (
                  <div key={star} className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 w-16">
                      <span className="text-sm font-body font-medium text-[#2C2621]">{star}</span>
                      <Star className="w-4 h-4 fill-[#C4975A] text-[#C4975A]" />
                  </div>
                  <div className="flex-1 h-2.5 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#CDC0B0]/30">
                    <div
                      className="h-full bg-[#C4975A] rounded-full"
                      style={{ width: `${ratingDistribution[index]}%` }}
                    />
                  </div>
                  <span className="text-sm font-body text-[#6B5E54] w-12 text-right">
                    {Math.round(ratingDistribution[index])}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Filters */}
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
                />
              </div>

              {/* Rating Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <button
                  onClick={() => setRatingFilter('all')}
                  className={`px-4 h-12 flex items-center justify-center rounded-xl font-body whitespace-nowrap transition-colors ${ratingFilter === 'all' ? 'bg-[#2C2621] text-[#EEDDCC]' : 'bg-[#FDFBF7] text-[#6B5E54] hover:bg-[#EEDDCC] border border-[#CDC0B0]'}`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating.toString())}
                    className={`px-4 h-12 flex items-center justify-center gap-1 rounded-xl font-body transition-colors whitespace-nowrap ${ratingFilter === rating.toString() ? 'bg-[#2C2621] text-[#EEDDCC]' : 'bg-[#FDFBF7] text-[#6B5E54] hover:bg-[#EEDDCC] border border-[#CDC0B0]'}`}
                  >
                    {rating} <Star className={`w-3.5 h-3.5 ${ratingFilter === rating.toString() ? 'fill-current' : 'fill-[#C4975A] text-[#C4975A]'}`} />
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 px-4 py-2 border border-[#CDC0B0] rounded-xl bg-[#FDFBF7] font-body text-[#2C2621] focus:outline-none focus:ring-2 focus:ring-[#CDB79E]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#EEDDCC]/50 border border-[#CDC0B0]/50 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-[#CDB79E]" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-2">No reviews found</h3>
              <p className="font-body text-[#6B5E54] max-w-md mx-auto">
                {searchQuery || ratingFilter !== 'all' 
                  ? "Try adjusting your filters to find what you're looking for." 
                  : "Your reviews will appear here once customers leave feedback on your services."}
              </p>
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
                <Card className="hover:shadow-warm-lg transition-shadow border-[#CDC0B0] bg-white rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 bg-[#EEDDCC] border border-[#CDC0B0]/50 shadow-sm">
                        <AvatarFallback className="bg-transparent text-[#2C2621] font-heading font-bold">
                          {review.customerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-heading font-bold text-[#2C2621] text-lg leading-tight">{review.customerName}</h3>
                            <p className="text-sm font-body text-[#9C8E82]">{review.serviceType}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#FDFBF7] px-2 py-1 rounded-lg border border-[#CDC0B0]/30">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm font-body text-[#9C8E82] whitespace-nowrap">{formatDate(review.date)}</span>
                          </div>
                        </div>
                        <p className="text-[#6B5E54] font-body leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
