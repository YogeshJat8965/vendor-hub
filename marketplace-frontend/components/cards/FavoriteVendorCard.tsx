'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Heart, MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FavoriteVendor {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  lastContacted?: string;
  isCertified?: boolean;
}

interface FavoriteVendorCardProps {
  vendor: FavoriteVendor;
  onRemove: (vendorId: string) => void;
  onRequestQuote: (vendorId: string) => void;
  index?: number;
}

export function FavoriteVendorCard({
  vendor,
  onRemove,
  onRequestQuote,
  index = 0,
}: FavoriteVendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all group">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {vendor.businessName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {vendor.category}
                </Badge>
                {vendor.isCertified && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(vendor.id)}
              className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 touch-target"
              title="Remove from favorites"
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Location & Rating */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {vendor.city}, {vendor.state}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{vendor.rating}</span>
              <span className="text-gray-500">({vendor.reviewCount})</span>
            </div>
          </div>

          {/* Last Contacted */}
          {vendor.lastContacted && (
            <div className="mb-4 text-xs text-gray-500">
              Last contacted {vendor.lastContacted}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="touch-target"
              asChild
            >
              <Link href={`/vendors/${vendor.slug}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
              onClick={() => onRequestQuote(vendor.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Get Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
