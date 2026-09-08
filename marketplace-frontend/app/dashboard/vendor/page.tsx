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
        return { Icon: Clock, color: 'text-[#C4975A]', bgColor: 'bg-[#C4975A]/10' };
      case 'accepted':
        return { Icon: CheckCircle, color: 'text-[#5B8C5A]', bgColor: 'bg-[#5B8C5A]/10' };
      case 'completed':
        return { Icon: CheckCircle, color: 'text-[#2C2621]', bgColor: 'bg-[#CDB79E]' };
      default:
        return { Icon: FileText, color: 'text-[#6B5E54]', bgColor: 'bg-[#EEDDCC]' };
    }
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

  const statsCards = [
    {
      title: 'Quote Requests',
      value: (stats?.quoteRequests ?? 0).toString(),
      change: `${stats?.pendingQuotes ?? 0} pending`,
      icon: FileText,
      color: 'text-[#C4975A]',
      bgColor: 'bg-[#C4975A]/10',
    },
    {
      title: 'Accepted Quotes',
      value: (stats?.acceptedQuotes ?? 0).toString(),
      change: `${stats?.completedQuotes ?? 0} completed`,
      icon: CheckCircle,
      color: 'text-[#5B8C5A]',
      bgColor: 'bg-[#5B8C5A]/10',
    },
    {
      title: 'Avg. Rating',
      value: (stats?.averageRating ?? 0).toFixed(1),
      change: `${stats?.totalReviews ?? 0} reviews`,
      icon: Star,
      color: 'text-[#CDB79E]',
      bgColor: 'bg-[#2C2621]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-accent text-2xl text-[#C4975A] mb-1">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#2C2621] mb-2">{user?.name}! 👋</h1>
        <p className="text-[#6B5E54] font-body">Here's an overview of your business performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="hover:shadow-warm-lg transition-shadow border-[#CDC0B0] bg-white rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-warm-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-[#9C8E82] text-sm font-body font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-heading font-bold text-[#2C2621] mb-1">{stat.value}</p>
                  <p className="text-xs text-[#6B5E54] font-body">{stat.change}</p>
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
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-[#2C2621]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-8 flex flex-col items-center gap-3 touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] rounded-2xl"
                asChild
              >
                <Link href="/dashboard/vendor/quotes">
                  <FileText className="w-8 h-8 text-[#C4975A]" />
                  <span className="font-heading font-bold text-[#2C2621]">View Quotes</span>
                  <span className="text-xs font-body text-[#9C8E82]">{stats.pendingQuotes} pending</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-8 flex flex-col items-center gap-3 touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] rounded-2xl"
                asChild
              >
                <Link href="/dashboard/vendor/profile">
                  <Users className="w-8 h-8 text-[#5B8C5A]" />
                  <span className="font-heading font-bold text-[#2C2621]">Edit Storefront</span>
                  <span className="text-xs font-body text-[#9C8E82]">Update profile</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-8 flex flex-col items-center gap-3 touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] rounded-2xl"
                asChild
              >
                <Link href="/dashboard/vendor/reviews">
                  <Star className="w-8 h-8 text-[#CDB79E]" />
                  <span className="font-heading font-bold text-[#2C2621]">Reviews</span>
                  <span className="text-xs font-body text-[#9C8E82]">{stats.totalReviews} total</span>
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
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#CDC0B0]/30 bg-[#FDFBF7]/50">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Recent Quote Requests</CardTitle>
            <Button variant="ghost" size="sm" className="font-body text-[#6B5E54] hover:text-[#2C2621]" asChild>
              <Link href="/dashboard/vendor/quotes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentQuotes.length > 0 ? (
              <div className="divide-y divide-[#CDC0B0]/30">
                {recentQuotes.map((quote) => {
                  const { Icon, color, bgColor } = getStatusIcon(quote.status);
                  return (
                    <div key={quote.id} className="p-6 hover:bg-[#FDFBF7] transition-colors">
                      <div className="flex gap-4">
                        <div className={`${bgColor} ${color} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#CDC0B0]/50`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-heading font-bold text-[#2C2621] text-base">{quote.customerEmail}</h4>
                            <span className="text-xs font-body text-[#9C8E82]">{getTimeAgo(quote.createdAt)}</span>
                        </div>
                        <p className="text-sm font-body text-[#6B5E54] mb-1 line-clamp-1">{quote.serviceType}</p>
                        <p className="text-xs font-body text-[#9C8E82] capitalize">Status: {quote.status}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={quote.status === 'PENDING' ? 'default' : 'outline'}
                        className={`font-body rounded-xl ${quote.status === 'PENDING' ? 'bg-[#C4975A] hover:bg-[#B38549] text-white border-none' : 'border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7]'}`}
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
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-[#CDC0B0] mx-auto mb-4" />
                <p className="text-[#9C8E82] font-body mb-6">No quote requests yet</p>
                <Button variant="outline" className="border-[#CDC0B0] text-[#2C2621] rounded-xl font-body" asChild>
                  <Link href={`/vendors/${user?.email}`}>View Your Storefront</Link>
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
        <Card className="bg-[#2C2621] text-[#EEDDCC] border-none rounded-3xl overflow-hidden relative shadow-warm-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4975A] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <TrendingUp className="w-6 h-6 text-[#CDB79E]" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-white">Great Performance!</h3>
                <p className="text-[#CDB79E] font-body">You have received {stats.quoteRequests} quote requests</p>
              </div>
            </div>
            <p className="text-sm font-body text-[#9C8E82] mb-6">
              Keep responding to quotes quickly to maintain your excellent reputation.
            </p>
            <Button
              className="bg-[#CDB79E] text-[#2C2621] hover:bg-[#CDC0B0] font-body rounded-xl border-none font-medium"
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
