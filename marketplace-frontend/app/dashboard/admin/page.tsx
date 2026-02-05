'use client';

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
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

const stats = [
  {
    label: 'Total Users',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'blue',
  },
  {
    label: 'Active Vendors',
    value: '342',
    change: '+8',
    trend: 'up',
    icon: Building2,
    color: 'orange',
  },
  {
    label: 'Total Revenue',
    value: '$48,392',
    change: '+23%',
    trend: 'up',
    icon: DollarSign,
    color: 'green',
  },
  {
    label: 'Avg Rating',
    value: '4.7',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'yellow',
  },
];

const pendingActions = [
  {
    id: 1,
    type: 'vendor_approval',
    title: 'New Vendor Registration',
    description: 'Elite Electrical Services - Pending approval',
    time: '2 hours ago',
    priority: 'high',
  },
  {
    id: 2,
    type: 'flagged_review',
    title: 'Flagged Review',
    description: 'Inappropriate content reported by user',
    time: '4 hours ago',
    priority: 'medium',
  },
  {
    id: 3,
    type: 'vendor_approval',
    title: 'New Vendor Registration',
    description: 'Perfect Painting Co. - Pending approval',
    time: '1 day ago',
    priority: 'high',
  },
];

const recentActivity = [
  {
    id: 1,
    action: 'User registered',
    user: 'Sarah Johnson',
    time: '5 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    action: 'Vendor approved',
    user: 'Johns Plumbing Services',
    time: '1 hour ago',
    status: 'success',
  },
  {
    id: 3,
    action: 'Review flagged',
    user: 'Review #1234',
    time: '2 hours ago',
    status: 'warning',
  },
  {
    id: 4,
    action: 'Payment received',
    user: '$125.00 from Premium Subscription',
    time: '3 hours ago',
    status: 'success',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl">
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
        {stats.map((stat) => {
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
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Link href="/dashboard/admin/vendors">
              <Button variant="outline" className="w-full touch-target">
                View All Pending
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-green-100' : 'bg-orange-100'
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
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
                <Badge variant="secondary" className="bg-red-100 text-red-600">8 pending</Badge>
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
                <Badge variant="secondary" className="bg-red-100 text-red-600">3 flagged</Badge>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
