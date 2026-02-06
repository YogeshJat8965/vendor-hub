'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Heart,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

// Mock data - will be replaced with API
const stats = [
  {
    title: 'Active Quotes',
    value: '3',
    change: '+2 this week',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Favorite Vendors',
    value: '12',
    change: '+3 this month',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Total Spent',
    value: '$2,450',
    change: 'This year',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Reviews Given',
    value: '8',
    change: '4.9 avg rating',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'quote',
    title: 'New quote received',
    description: 'Johns Plumbing Services responded to your quote request',
    time: '2 hours ago',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  {
    id: '2',
    type: 'quote',
    title: 'Quote pending',
    description: 'Waiting for Elite Electrical Solutions to respond',
    time: '1 day ago',
    icon: Clock,
    iconColor: 'text-orange-600',
  },
  {
    id: '3',
    type: 'favorite',
    title: 'Added to favorites',
    description: 'You added Perfect Painting Co to your favorites',
    time: '3 days ago',
    icon: Heart,
    iconColor: 'text-pink-600',
  },
  {
    id: '4',
    type: 'review',
    title: 'Review submitted',
    description: 'You reviewed Green Thumb Landscaping',
    time: '1 week ago',
    icon: Star,
    iconColor: 'text-yellow-600',
  },
];

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

interface Quote {
  id: string;
  status: string;
  serviceRequested: string;
  projectDescription?: string;
  vendorSlug: string;
  createdAt: string;
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState({
    activeQuotes: 0,
    pendingQuotes: 0,
    completedQuotes: 0,
    totalQuotes: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch customer quotes
      const response = await apiClient.get(`/quotes/customer?email=${user?.email}`);
      const quotesData = response.data || [];
      setQuotes(quotesData);

      // Calculate stats
      const active = quotesData.filter((q: Quote) => q.status === 'PENDING' || q.status === 'ACCEPTED').length;
      const pending = quotesData.filter((q: Quote) => q.status === 'PENDING').length;
      const completed = quotesData.filter((q: Quote) => q.status === 'COMPLETED').length;

      setStats({
        activeQuotes: active,
        pendingQuotes: pending,
        completedQuotes: completed,
        totalQuotes: quotesData.length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentQuotes = () => {
    return quotes.slice(0, 5).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statsCards = [
    {
      title: 'Active Quotes',
      value: stats.activeQuotes.toString(),
      change: `${stats.pendingQuotes} pending`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed',
      value: stats.completedQuotes.toString(),
      change: 'This year',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Quotes',
      value: stats.totalQuotes.toString(),
      change: 'All time',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Favorites',
      value: localStorage.getItem('favorites')?.split(',').filter(Boolean).length.toString() || '0',
      change: 'Saved vendors',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user?.name || 'there'}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your quotes and favorites</p>
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
                className="h-auto py-6 flex flex-col items-center gap-2 touch-target"
                asChild
              >
                <Link href="/explore">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold">Request Quote</span>
                  <span className="text-xs text-gray-500">Find vendors</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2 touch-target"
                asChild
              >
                <Link href="/dashboard/customer/quotes">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <span className="font-semibold">View Quotes</span>
                  <span className="text-xs text-gray-500">3 pending</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2 touch-target"
                asChild
              >
                <Link href="/dashboard/customer/favorites">
                  <Heart className="w-8 h-8 text-pink-600" />
                  <span className="font-semibold">My Favorites</span>
                  <span className="text-xs text-gray-500">12 vendors</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quotes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/customer/quotes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {getRecentQuotes().length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No quotes yet</p>
                <Button asChild>
                  <Link href="/explore">Browse Vendors</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {getRecentQuotes().map((quote, index) => (
                  <div key={quote.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{quote.serviceRequested}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Vendor: {quote.vendorSlug}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
