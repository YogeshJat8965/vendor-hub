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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-600">Track your business performance</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {['7', '30', '90', '365'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === days
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Quotes</p>
                <p className="text-3xl font-bold">{analytics?.totalQuotes || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                <p className="text-3xl font-bold">{analytics?.totalViews || 0}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold">{analytics?.averageRating?.toFixed(1) || '0.0'}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold">{analytics?.totalReviews || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quote Requests Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Quote Requests Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.quoteTrend && analytics.quoteTrend.length > 0 ? (
                  analytics.quoteTrend.map((data, index) => {
                    const maxCount = Math.max(...analytics.quoteTrend.map((d) => d.count));
                    const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.count > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {data.count} quotes
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Profile Views Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.viewsTrend && analytics.viewsTrend.length > 0 ? (
                  analytics.viewsTrend.map((data, index) => {
                    const maxCount = Math.max(...analytics.viewsTrend.map((d) => d.count));
                    const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.count > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {data.count} views
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rating Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Rating Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics?.ratingTrend && analytics.ratingTrend.length > 0 ? (
                  analytics.ratingTrend.map((data, index) => {
                    const height = (data.rating / 5) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-yellow-500 rounded-t hover:bg-yellow-600 transition-colors relative group"
                          style={{ height: `${height}%`, minHeight: data.rating > 0 ? '20px' : '4px' }}
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {data.rating.toFixed(1)} ★
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center h-full text-gray-400">
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
