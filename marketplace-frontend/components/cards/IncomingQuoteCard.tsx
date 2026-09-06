'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Clock, Calendar, DollarSign, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface IncomingQuote {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  service: string;
  description: string;
  preferredDate?: string;
  budget?: number;
  createdAt: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
}

interface IncomingQuoteCardProps {
  quote: IncomingQuote;
  onRespond: (quoteId: string) => void;
  onAccept: (quoteId: string) => void;
  onDecline: (quoteId: string) => void;
  index?: number;
}

const statusConfig = {
  pending: {
    label: 'Awaiting Response',
    color: 'text-[#D97706]',
    bgColor: 'bg-[#FEF3C7]',
    borderColor: 'border-l-[#F59E0B]',
  },
  responded: {
    label: 'Quote Sent',
    color: 'text-[#C4975A]',
    bgColor: 'bg-[#FDFBF7]',
    borderColor: 'border-l-[#C4975A]',
  },
  accepted: {
    label: 'Accepted',
    color: 'text-[#8A9A5B]',
    bgColor: 'bg-[#F4F6F0]',
    borderColor: 'border-l-[#8A9A5B]',
  },
  declined: {
    label: 'Declined',
    color: 'text-[#B85C5C]',
    bgColor: 'bg-[#FDF2F2]',
    borderColor: 'border-l-[#B85C5C]',
  },
};

export function IncomingQuoteCard({
  quote,
  onRespond,
  onAccept,
  onDecline,
  index = 0,
}: IncomingQuoteCardProps) {
  const config = statusConfig[quote.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="w-12 h-12 border border-[#CDC0B0]">
                <AvatarFallback className="bg-[#EEDDCC] text-[#2C2621] font-heading font-bold text-lg">
                  {quote.customer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[#2C2621] text-lg mb-1">{quote.customer.name}</h3>
                <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 font-body font-medium`}>
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Service Request */}
          <div className="mb-5 p-5 bg-[#FDFBF7] border border-[#CDC0B0]/30 rounded-2xl">
            <h4 className="font-heading font-bold text-sm text-[#9C8E82] uppercase tracking-wider mb-2">Service Requested</h4>
            <p className="text-xl font-heading font-bold text-[#C4975A] mb-2">{quote.service}</p>
            <p className="text-sm font-body text-[#6B5E54] leading-relaxed">{quote.description}</p>
          </div>

          {/* Customer Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-sm font-body">
            <div className="flex items-center gap-2.5 text-[#6B5E54]">
              <Mail className="w-4 h-4 text-[#9C8E82]" />
              <span className="truncate">{quote.customer.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#6B5E54]">
              <Phone className="w-4 h-4 text-[#9C8E82]" />
              <span>{quote.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#6B5E54]">
              <MapPin className="w-4 h-4 text-[#9C8E82]" />
              <span className="truncate">{quote.customer.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#6B5E54]">
              <Clock className="w-4 h-4 text-[#9C8E82]" />
              <span>{formatDate(quote.createdAt)}</span>
            </div>
          </div>

          {/* Additional Details */}
          {(quote.preferredDate || quote.budget) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-[#EEDDCC]/30 rounded-2xl text-sm border border-[#CDC0B0]/30">
              {quote.preferredDate && (
                <div>
                  <div className="flex items-center gap-1.5 text-[#9C8E82] font-body mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Preferred Date</span>
                  </div>
                  <p className="font-heading font-medium text-[#2C2621]">{quote.preferredDate}</p>
                </div>
              )}
              {quote.budget && (
                <div>
                  <div className="flex items-center gap-1.5 text-[#9C8E82] font-body mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Budget Range</span>
                  </div>
                  <p className="font-heading font-bold text-lg text-[#8A9A5B]">${quote.budget.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {quote.status === 'pending' && (
              <>
                <Button
                  className="flex-1 bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl touch-target font-body shadow-warm-sm"
                  onClick={() => onRespond(quote.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#CDC0B0] text-[#B85C5C] hover:bg-[#FDF2F2] hover:text-[#B85C5C] hover:border-[#B85C5C]/50 rounded-xl touch-target font-body"
                  onClick={() => onDecline(quote.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </>
            )}
            {quote.status === 'responded' && (
              <Button
                variant="outline"
                className="flex-1 touch-target rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body"
                onClick={() => onRespond(quote.id)}
              >
                View Sent Quote
              </Button>
            )}
            {quote.status === 'accepted' && (
              <Button
                variant="outline"
                className="flex-1 text-[#8A9A5B] border-[#8A9A5B]/30 bg-[#F4F6F0] rounded-xl touch-target font-body opacity-80"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Customer Accepted
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
