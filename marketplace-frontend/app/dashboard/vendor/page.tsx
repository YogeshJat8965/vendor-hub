'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Quote {
  id: string;
  customerEmail: string;
  serviceType: string;
  status: string;
  createdAt: string;
  description: string;
}

interface VendorStats {
  totalViews: number;
  quoteRequests: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  completedQuotes: number;
  averageRating: number;
  totalReviews: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<VendorStats>({
    totalViews: 0,
    quoteRequests: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    completedQuotes: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch vendor stats
      const statsResponse = await apiClient.get(`/vendor/dashboard/stats?email=${user?.email}`);
      if (statsResponse.data) {
        setStats({
          totalViews: statsResponse.data.totalViews || 0,
          quoteRequests: statsResponse.data.quoteRequests || 0,
          pendingQuotes: statsResponse.data.pendingQuotes || 0,
          acceptedQuotes: statsResponse.data.acceptedQuotes || 0,
          completedQuotes: statsResponse.data.completedQuotes || 0,
          averageRating: statsResponse.data.averageRating || 0,
          totalReviews: statsResponse.data.totalReviews || 0,
        });
      }

      // Fetch recent quotes
      const quotesResponse = await apiClient.get(`/quotes/vendor?email=${user?.email}&limit=5`);
      if (quotesResponse.data && Array.isArray(quotesResponse.data)) {
        setRecentQuotes(quotesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { Icon: Clock, color: 'text-orange-600' };
      case 'accepted':
        return { Icon: CheckCircle, color: 'text-blue-600' };
      case 'completed':
        return { Icon: CheckCircle, color: 'text-green-600' };
      default:
        return { Icon: FileText, color: 'text-gray-600' };
    }
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

  const statsCards = [
    {
      title: 'Total Views',
      value: (stats?.totalViews ?? 0).toLocaleString(),
      change: 'This month',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Quote Requests',
      value: (stats?.quoteRequests ?? 0).toString(),
      change: `${stats?.pendingQuotes ?? 0} pending`,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Accepted Quotes',
      value: (stats?.acceptedQuotes ?? 0).toString(),
      change: `${stats?.completedQuotes ?? 0} completed`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg. Rating',
      value: (stats?.averageRating ?? 0).toFixed(1),
      change: `${stats?.totalReviews ?? 0} reviews`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's an overview of your business performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2"
                asChild
              >
                <Link href="/dashboard/vendor/quotes">
                  <FileText className="w-8 h-8 text-orange-600" />
                  <span className="font-semibold">View Quotes</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingQuotes} pending</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2"
                asChild
              >
                <Link href="/dashboard/vendor/profile">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold">Edit Storefront</span>
                  <span className="text-xs text-gray-500">Update profile</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2"
                asChild
              >
                <Link href="/dashboard/vendor/reviews">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <span className="font-semibold">Reviews</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{stats.totalReviews} total</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Quote Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quote Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/vendor/quotes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentQuotes.length > 0 ? (
              <div className="space-y-4">
                {recentQuotes.map((quote, index) => {
                  const { Icon, color } = getStatusIcon(quote.status);
                  return (
                    <div key={quote.id}>
                      {index > 0 && <div className="border-t my-4" />}
                      <div className="flex gap-4">
                        <div className={`${color} w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-sm">{quote.customerEmail}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(quote.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-1">{quote.serviceType}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Status: {quote.status}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={quote.status === 'PENDING' ? 'default' : 'outline'}
                        className={quote.status === 'PENDING' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                        asChild
                      >
                        <Link href="/dashboard/vendor/quotes">
                          {quote.status === 'PENDING' ? 'Respond' : 'View'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No quote requests yet</p>
                <Button variant="outline" asChild>
                  <Link href="/vendors/{user?.email}">View Your Storefront</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Great Performance!</h3>
                <p className="text-blue-100">Your profile has {stats.totalViews} views</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Keep responding to quotes quickly to maintain your excellent reputation.
            </p>
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/dashboard/vendor/profile">
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
