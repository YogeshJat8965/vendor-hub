'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  DollarSign, 
  Star, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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

interface DashboardStats {
  totalUsers: number;
  activeVendors: number;
  totalRevenue: number;
  averageRating: number;
  userGrowth: string;
  vendorGrowth: string;
  revenueGrowth: string;
  ratingChange: string;
}

interface PendingAction {
  id: string;
  type: 'vendor_approval' | 'flagged_review';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  vendorId?: string;
  reviewId?: string;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await apiClient.get('/admin/dashboard');
      setStats(statsResponse.data);
      
      // Fetch pending actions
      const actionsResponse = await apiClient.get('/admin/pending-actions');
      setPendingActions(actionsResponse.data || []);
      
      // Fetch recent activity
      const activityResponse = await apiClient.get('/admin/recent-activity?limit=10');
      setRecentActivity(activityResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers.toLocaleString() || '0',
      change: stats?.userGrowth || '+0%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Vendors',
      value: stats?.activeVendors.toLocaleString() || '0',
      change: stats?.vendorGrowth || '+0',
      trend: 'up',
      icon: Building2,
      color: 'orange',
    },
    {
      label: 'Total Revenue',
      value: `$${stats?.totalRevenue.toLocaleString() || '0'}`,
      change: stats?.revenueGrowth || '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Avg Rating',
      value: stats?.averageRating.toFixed(1) || '0.0',
      change: stats?.ratingChange || '+0.0',
      trend: 'up',
      icon: Star,
      color: 'yellow',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const iconColors = {
              blue: 'text-blue-600 bg-blue-100',
              orange: 'text-orange-600 bg-orange-100',
              green: 'text-green-600 bg-green-100',
              yellow: 'text-yellow-600 bg-yellow-100',
            };

            return (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                        <div className="flex items-center gap-1">
                          {stat.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500">vs last month</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${iconColors[stat.color as keyof typeof iconColors]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Actions</CardTitle>
              <Badge variant="secondary" className="bg-red-100 text-red-600">
                {pendingActions.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingActions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All caught up! No pending actions.</p>
                </div>
              ) : (
                <>
                  {pendingActions.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.priority === 'high' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {item.type === 'vendor_approval' ? (
                          <Building2 className={`w-5 h-5 ${item.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
                        ) : (
                          <AlertCircle className={`w-5 h-5 ${item.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{getTimeAgo(item.time)}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Link href="/dashboard/admin/vendors">
                    <Button variant="outline" className="w-full">
                      View All Pending
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' : activity.status === 'warning' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        {activity.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.user}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/dashboard/admin/vendors">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-blue-500 hover:text-blue-600">
                  <Building2 className="w-8 h-8" />
                  <span className="font-medium">Manage Vendors</span>
                  {pendingActions.filter(a => a.type === 'vendor_approval').length > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-600">
                      {pendingActions.filter(a => a.type === 'vendor_approval').length} pending
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-blue-500 hover:text-blue-600">
                  <Users className="w-8 h-8" />
                  <span className="font-medium">Manage Users</span>
                </Button>
              </Link>
              <Link href="/dashboard/admin/categories">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-blue-500 hover:text-blue-600">
                  <Building2 className="w-8 h-8" />
                  <span className="font-medium">Categories</span>
                </Button>
              </Link>
              <Link href="/dashboard/admin/reviews">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-blue-500 hover:text-blue-600">
                  <AlertCircle className="w-8 h-8" />
                  <span className="font-medium">Flagged Reviews</span>
                  {pendingActions.filter(a => a.type === 'flagged_review').length > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-600">
                      {pendingActions.filter(a => a.type === 'flagged_review').length} flagged
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
