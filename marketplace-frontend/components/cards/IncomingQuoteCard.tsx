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
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  responded: {
    label: 'Quote Sent',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  declined: {
    label: 'Declined',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
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
      <Card className={`overflow-hidden border-l-4 ${config.borderColor} hover:shadow-lg transition-all`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {quote.customer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">{quote.customer.name}</h3>
                <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Service Request */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Service Requested</h4>
            <p className="text-lg font-medium text-blue-600 mb-2">{quote.service}</p>
            <p className="text-sm text-gray-700">{quote.description}</p>
          </div>

          {/* Customer Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{quote.customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{quote.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{quote.customer.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDate(quote.createdAt)}</span>
            </div>
          </div>

          {/* Additional Details */}
          {(quote.preferredDate || quote.budget) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              {quote.preferredDate && (
                <div>
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Preferred Date</span>
                  </div>
                  <p className="font-medium">{quote.preferredDate}</p>
                </div>
              )}
              {quote.budget && (
                <div>
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Budget Range</span>
                  </div>
                  <p className="font-medium text-green-600">${quote.budget.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {quote.status === 'pending' && (
              <>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
                  onClick={() => onRespond(quote.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50 touch-target"
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
                className="flex-1 touch-target"
                onClick={() => onRespond(quote.id)}
              >
                View Sent Quote
              </Button>
            )}
            {quote.status === 'accepted' && (
              <Button
                variant="outline"
                className="flex-1 text-green-600 border-green-200 bg-green-50 touch-target"
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
