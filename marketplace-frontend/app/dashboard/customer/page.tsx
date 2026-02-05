'use client';

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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your quotes and favorites</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
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
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex gap-4">
                      <div className={`${activity.iconColor} w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
