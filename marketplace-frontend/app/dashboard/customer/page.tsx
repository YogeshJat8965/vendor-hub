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
        return 'bg-[#EEDDCC] text-[#2C2621]';
      case 'ACCEPTED':
        return 'bg-[#5B8C5A]/20 text-[#5B8C5A]';
      case 'REJECTED':
        return 'bg-[#B85C5C]/20 text-[#B85C5C]';
      case 'COMPLETED':
        return 'bg-[#CDB79E] text-[#2C2621]';
      default:
        return 'bg-[#CDC0B0] text-[#2C2621]';
    }
  };

  const statsCards = [
    {
      title: 'Active Quotes',
      value: stats.activeQuotes.toString(),
      change: `${stats.pendingQuotes} pending`,
      icon: FileText,
      color: 'text-[#2C2621]',
      bgColor: 'bg-[#EEDDCC]',
    },
    {
      title: 'Completed',
      value: stats.completedQuotes.toString(),
      change: 'All time',
      icon: CheckCircle,
      color: 'text-[#5B8C5A]',
      bgColor: 'bg-[#5B8C5A]/10',
    },
    {
      title: 'Total Quotes',
      value: stats.totalQuotes.toString(),
      change: 'Lifetime requests',
      icon: TrendingUp,
      color: 'text-[#C4975A]',
      bgColor: 'bg-[#C4975A]/10',
    },
    {
      title: 'Favorites',
      value: localStorage.getItem('favorites')?.split(',').filter(Boolean).length.toString() || '0',
      change: 'Saved professionals',
      icon: Heart,
      color: 'text-[#2C2621]',
      bgColor: 'bg-[#EEDDCC]',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#FDFBF7] p-4 sm:p-8 rounded-3xl min-h-[calc(100vh-6rem)]">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-accent text-2xl text-[#CDB79E] mb-1">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#2C2621] mb-2">
          {user?.name || 'there'}!
        </h1>
        <p className="text-[#6B5E54] font-body">Here's what's happening with your quotes and favorites</p>
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
                <Link href="/explore">
                  <FileText className="w-8 h-8 text-[#C4975A]" />
                  <span className="font-heading font-bold text-[#2C2621]">Request Quote</span>
                  <span className="text-xs font-body text-[#9C8E82]">Find professionals</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-8 flex flex-col items-center gap-3 touch-target border-[#CDC0B0] hover:border-[#9C8E82] hover:bg-[#FDFBF7] rounded-2xl"
                asChild
              >
                <Link href="/dashboard/customer/quotes">
                  <Clock className="w-8 h-8 text-[#9C8E82]" />
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
                <Link href="/dashboard/customer/favorites">
                  <Heart className="w-8 h-8 text-[#CDB79E]" />
                  <span className="font-heading font-bold text-[#2C2621]">My Favorites</span>
                  <span className="text-xs font-body text-[#9C8E82]">Saved professionals</span>
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
        <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#CDC0B0]/30 bg-[#FDFBF7]/50">
            <CardTitle className="font-heading text-xl text-[#2C2621]">Recent Quotes</CardTitle>
            <Button variant="ghost" size="sm" className="font-body text-[#6B5E54] hover:text-[#2C2621]" asChild>
              <Link href="/dashboard/customer/quotes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {getRecentQuotes().length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-[#CDC0B0]" />
                <p className="text-[#9C8E82] font-body mb-6">No quotes requested yet</p>
                <Button className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] rounded-xl font-body" asChild>
                  <Link href="/explore">Discover Design Partners</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#CDC0B0]/30">
                {getRecentQuotes().map((quote) => (
                  <div key={quote.id} className="p-6 hover:bg-[#FDFBF7] transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-[#EEDDCC]/50 flex items-center justify-center flex-shrink-0 border border-[#CDC0B0]/50">
                        <FileText className="w-6 h-6 text-[#2C2621]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-heading font-bold text-[#2C2621] text-base truncate">{quote.serviceRequested}</h4>
                          <span className={`text-xs font-body font-medium px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B5E54] font-body mb-1">Professional: <span className="font-medium text-[#2C2621]">{quote.vendorSlug}</span></p>
                        <p className="text-xs text-[#9C8E82] font-body">
                          {new Date(quote.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
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
