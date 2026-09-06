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
      <Card className="overflow-hidden bg-white border border-[#CDC0B0] shadow-warm-sm hover:shadow-warm-md transition-all group rounded-3xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-[#2C2621] text-lg mb-2 line-clamp-1 group-hover:text-[#C4975A] transition-colors">
                {vendor.businessName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-body font-medium text-[#6B5E54] border-[#CDC0B0]/50">
                  {vendor.category}
                </Badge>
                {vendor.isCertified && (
                  <Badge variant="outline" className="text-xs font-body font-medium bg-[#F4F6F0] text-[#8A9A5B] border-0">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(vendor.id)}
              className="text-[#9C8E82] hover:text-[#B85C5C] transition-colors p-2.5 rounded-full hover:bg-[#FDF2F2] touch-target -mr-2 -mt-2"
              title="Remove from favorites"
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Location & Rating */}
          <div className="flex items-center justify-between mb-5 text-sm font-body">
            <div className="flex items-center gap-1.5 text-[#6B5E54]">
              <MapPin className="w-4 h-4 text-[#9C8E82]" />
              <span className="line-clamp-1">
                {vendor.city}, {vendor.state}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[#C4975A] text-[#C4975A]" />
              <span className="font-semibold text-[#2C2621]">{vendor.rating}</span>
              <span className="text-[#9C8E82]">({vendor.reviewCount})</span>
            </div>
          </div>

          {/* Last Contacted */}
          {vendor.lastContacted && (
            <div className="mb-5 text-xs font-body text-[#9C8E82] bg-[#FDFBF7] p-2 rounded-lg border border-[#CDC0B0]/30 inline-block">
              Last contacted {vendor.lastContacted}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="touch-target rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] font-body"
              asChild
            >
              <Link href={`/vendors/${vendor.slug}`}>
                <ExternalLink className="w-4 h-4 mr-2 text-[#9C8E82]" />
                View Profile
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl touch-target font-body shadow-warm-sm"
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
