'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, DollarSign, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Quote {
  id: string;
  vendor: {
    id: string;
    name: string;
    avatar?: string;
    city: string;
    state: string;
  };
  service: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';
  amount?: number;
  createdAt: string;
  respondedAt?: string;
  completedAt?: string;
}

interface QuoteCardProps {
  quote: Quote;
  onViewDetails: (quoteId: string) => void;
  index?: number;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
};

export function QuoteCard({ quote, onViewDetails, index = 0 }: QuoteCardProps) {
  const config = statusConfig[quote.status];
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`overflow-hidden border-l-4 ${config.borderColor} hover:shadow-lg transition-all`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg line-clamp-1">{quote.service}</h3>
                <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{quote.description}</p>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {quote.vendor.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{quote.vendor.name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{quote.vendor.city}, {quote.vendor.state}</span>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Requested</span>
              </div>
              <p className="font-medium">{formatDate(quote.createdAt)}</p>
            </div>
            {quote.amount && (
              <div>
                <div className="flex items-center gap-1 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Quote Amount</span>
                </div>
                <p className="font-bold text-lg text-green-600">${quote.amount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={() => onViewDetails(quote.id)}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {quote.status === 'accepted' && (
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
              >
                Contact Vendor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
