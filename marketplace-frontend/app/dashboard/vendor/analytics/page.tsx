'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, MessageSquare, Star, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AnalyticsData {
  quoteTrend: { date: string; count: number }[];
  viewsTrend: { date: string; count: number }[];
  ratingTrend: { date: string; rating: number }[];
  totalQuotes: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
}

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/vendor/analytics?email=${user?.email}&period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] rounded-3xl pt-8 sm:pt-12 px-4 sm:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">Analytics</h1>
            <p className="text-[#6B5E54] font-body">Track your business performance and engagement.</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-[#CDC0B0]/50 shadow-sm inline-flex">
            {['7', '30', '90', '365'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg font-body font-medium transition-colors text-sm ${
                  period === days
                    ? 'bg-[#C4975A] text-white shadow-sm'
                    : 'bg-transparent text-[#6B5E54] hover:bg-[#FDFBF7]'
                }`}
              >
                {days === '7' ? '7D' : days === '30' ? '30D' : days === '90' ? '90D' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm hover:shadow-warm-md transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30 group-hover:bg-[#EEDDCC] transition-colors">
                    <MessageSquare className="h-6 w-6 text-[#C4975A]" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-[#8A9A5B]" />
                </div>
                <p className="text-sm font-body font-medium text-[#9C8E82] mb-1 uppercase tracking-wider">Total Quotes</p>
                <p className="text-4xl font-heading font-bold text-[#2C2621]">{analytics?.totalQuotes || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm hover:shadow-warm-md transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30 group-hover:bg-[#EEDDCC] transition-colors">
                    <Eye className="h-6 w-6 text-[#C4975A]" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-[#8A9A5B]" />
                </div>
                <p className="text-sm font-body font-medium text-[#9C8E82] mb-1 uppercase tracking-wider">Profile Views</p>
                <p className="text-4xl font-heading font-bold text-[#2C2621]">{analytics?.totalViews || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm hover:shadow-warm-md transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30 group-hover:bg-[#EEDDCC] transition-colors">
                    <Star className="h-6 w-6 text-[#C4975A]" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-[#8A9A5B]" />
                </div>
                <p className="text-sm font-body font-medium text-[#9C8E82] mb-1 uppercase tracking-wider">Average Rating</p>
                <p className="text-4xl font-heading font-bold text-[#2C2621]">{analytics?.averageRating?.toFixed(1) || '0.0'}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm hover:shadow-warm-md transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30 group-hover:bg-[#EEDDCC] transition-colors">
                    <Calendar className="h-6 w-6 text-[#C4975A]" />
                  </div>
                  <div className="h-5 w-5"></div>
                </div>
                <p className="text-sm font-body font-medium text-[#9C8E82] mb-1 uppercase tracking-wider">Total Reviews</p>
                <p className="text-4xl font-heading font-bold text-[#2C2621]">{analytics?.totalReviews || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Requests Chart */}
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <MessageSquare className="h-5 w-5 text-[#C4975A]" />
                Quote Requests Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.quoteTrend && analytics.quoteTrend.length > 0 ? (
                  analytics.quoteTrend.map((data, index) => {
                    const maxCount = Math.max(...analytics.quoteTrend.map((d) => d.count));
                    const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-[#CDB79E] rounded-t-sm hover:bg-[#C4975A] transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.count > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2C2621] text-[#FDFBF7] font-body text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                            {data.count} quotes
                          </div>
                        </div>
                        <span className="text-xs font-body font-medium text-[#9C8E82] mt-3 rotate-45 origin-top-left md:rotate-0">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-[#9C8E82] font-body">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Views Chart */}
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <Eye className="h-5 w-5 text-[#C4975A]" />
                Profile Views Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.viewsTrend && analytics.viewsTrend.length > 0 ? (
                  analytics.viewsTrend.map((data, index) => {
                    const maxCount = Math.max(...analytics.viewsTrend.map((d) => d.count));
                    const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-[#EEDDCC] rounded-t-sm hover:bg-[#D4A373] transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.count > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2C2621] text-[#FDFBF7] font-body text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                            {data.count} views
                          </div>
                        </div>
                        <span className="text-xs font-body font-medium text-[#9C8E82] mt-3 rotate-45 origin-top-left md:rotate-0">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-[#9C8E82] font-body">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating Trend Chart */}
          <Card className="lg:col-span-2 border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-[#2C2621]">
                <Star className="h-5 w-5 text-[#C4975A]" />
                Rating Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.ratingTrend && analytics.ratingTrend.length > 0 ? (
                  analytics.ratingTrend.map((data, index) => {
                    const height = (data.rating / 5) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-[#EEDDCC] to-[#C4975A] rounded-t-sm hover:from-[#D4A373] hover:to-[#B38549] transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.rating > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2C2621] text-[#FDFBF7] font-body text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                            {data.rating.toFixed(1)} ★
                          </div>
                        </div>
                        <span className="text-xs font-body font-medium text-[#9C8E82] mt-3">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-[#9C8E82] font-body">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
