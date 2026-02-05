'use client';

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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data - will be replaced with API
const stats = [
  {
    title: 'Total Views',
    value: '1,234',
    change: '+12% this month',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Quote Requests',
    value: '45',
    change: '+5 this week',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Revenue (Est.)',
    value: '$8,750',
    change: 'This month',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Avg. Rating',
    value: '4.8',
    change: '127 reviews',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
];

const recentQuotes = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    service: 'Emergency Plumbing Repair',
    date: '2 hours ago',
    status: 'pending',
    icon: Clock,
    iconColor: 'text-orange-600',
  },
  {
    id: '2',
    customer: 'Mike Williams',
    service: 'Water Heater Installation',
    date: '5 hours ago',
    status: 'pending',
    icon: Clock,
    iconColor: 'text-orange-600',
  },
  {
    id: '3',
    customer: 'Emily Chen',
    service: 'Bathroom Fixture Repair',
    date: '1 day ago',
    status: 'responded',
    icon: CheckCircle,
    iconColor: 'text-green-600',
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

export default function VendorDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600">Here's an overview of your business performance</p>
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
                <Link href="/dashboard/vendor/quotes">
                  <FileText className="w-8 h-8 text-orange-600" />
                  <span className="font-semibold">View Quotes</span>
                  <span className="text-xs text-gray-500">5 pending</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2 touch-target"
                asChild
              >
                <Link href="/dashboard/vendor/storefront">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold">Edit Storefront</span>
                  <span className="text-xs text-gray-500">Update profile</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2 touch-target"
                asChild
              >
                <Link href="/dashboard/vendor/reviews">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <span className="font-semibold">Reviews</span>
                  <span className="text-xs text-gray-500">127 total</span>
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
            <div className="space-y-4">
              {recentQuotes.map((quote, index) => {
                const Icon = quote.icon;
                return (
                  <div key={quote.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex gap-4">
                      <div className={`${quote.iconColor} w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-sm">{quote.customer}</h4>
                          <span className="text-xs text-gray-500">{quote.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{quote.service}</p>
                        <p className="text-xs text-gray-500 capitalize">Status: {quote.status}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={quote.status === 'pending' ? 'default' : 'outline'}
                        className={quote.status === 'pending' ? 'bg-gradient-to-r from-blue-600 to-purple-600 touch-target' : 'touch-target'}
                      >
                        {quote.status === 'pending' ? 'Respond' : 'View'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <p className="text-blue-100">Your profile views increased by 12% this month</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Keep responding to quotes quickly to maintain your excellent reputation.
            </p>
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 touch-target"
              asChild
            >
              <Link href="/dashboard/vendor/storefront">
                Update Storefront
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
