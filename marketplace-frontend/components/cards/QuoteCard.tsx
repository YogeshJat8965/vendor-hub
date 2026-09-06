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
    color: 'text-[#D97706]',
    bgColor: 'bg-[#FEF3C7]',
    borderColor: 'border-l-[#F59E0B]',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-[#8A9A5B]',
    bgColor: 'bg-[#F4F6F0]',
    borderColor: 'border-l-[#8A9A5B]',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-[#B85C5C]',
    bgColor: 'bg-[#FDF2F2]',
    borderColor: 'border-l-[#B85C5C]',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-[#C4975A]',
    bgColor: 'bg-[#FDFBF7]',
    borderColor: 'border-l-[#C4975A]',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'text-[#9C8E82]',
    bgColor: 'bg-[#EEDDCC]/50',
    borderColor: 'border-l-[#CDC0B0]',
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
      <Card className={`overflow-hidden border border-[#CDC0B0]/50 border-l-4 ${config.borderColor} hover:shadow-warm-md transition-all bg-white rounded-3xl`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-bold text-lg text-[#2C2621] line-clamp-1">{quote.service}</h3>
                <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 font-body font-medium`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm font-body text-[#6B5E54] line-clamp-2 mb-3 leading-relaxed">{quote.description}</p>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-[#FDFBF7] rounded-2xl border border-[#CDC0B0]/30">
            <div className="w-12 h-12 rounded-xl bg-[#EEDDCC] flex items-center justify-center text-[#2C2621] font-heading font-bold text-lg flex-shrink-0">
              {quote.vendor.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-bold text-[#2C2621] truncate">{quote.vendor.name}</h4>
              <div className="flex items-center gap-1 text-xs font-body text-[#9C8E82] mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{quote.vendor.city}, {quote.vendor.state}</span>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[#9C8E82] font-body mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-medium">Requested</span>
              </div>
              <p className="font-heading font-medium text-[#2C2621]">{formatDate(quote.createdAt)}</p>
            </div>
            {quote.amount && (
              <div>
                <div className="flex items-center gap-1.5 text-[#9C8E82] font-body mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-medium">Quote Amount</span>
                </div>
                <p className="font-heading font-bold text-lg text-[#8A9A5B]">${quote.amount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 touch-target rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body shadow-sm"
              onClick={() => onViewDetails(quote.id)}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {quote.status === 'accepted' && (
              <Button
                className="flex-1 bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl touch-target font-body shadow-warm-sm"
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
