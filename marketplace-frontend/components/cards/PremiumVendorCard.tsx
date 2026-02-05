'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, BadgeCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

interface PremiumVendorCardProps {
  vendor: {
    id: string;
    slug: string;
    businessName: string;
    logoUrl?: string;
    bannerUrl?: string;
    category: string;
    city: string;
    state: string;
    rating: number;
    reviewCount: number;
    description: string;
    isCertified?: boolean;
    isPromoted?: boolean;
    yearsInBusiness?: number;
  };
  index?: number;
}

export function PremiumVendorCard({ vendor, index = 0 }: PremiumVendorCardProps) {
  const {
    slug,
    businessName,
    logoUrl,
    bannerUrl,
    category,
    city,
    state,
    rating,
    reviewCount,
    description,
    isCertified,
    isPromoted,
    yearsInBusiness,
  } = vendor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -12, transition: { duration: 0.3 } }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/vendors/${slug}`}>
        {/* Banner Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={`${businessName} banner`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isPromoted && (
              <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 touch-target">
                <TrendingUp className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {isCertified && (
              <Badge className="bg-blue-600 text-white border-0 touch-target">
                <BadgeCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Logo Overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg overflow-hidden border-4 border-white">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${businessName} logo`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {businessName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-12">
          {/* Business Name & Category */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
              {businessName}
            </h3>
            <p className="text-sm text-gray-500 font-medium">{category}</p>
          </div>

          {/* Rating & Location */}
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{city}, {state}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Experience Badge */}
          {yearsInBusiness && yearsInBusiness > 0 && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                {yearsInBusiness}+ years in business
              </Badge>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white touch-target group/btn"
            size="lg"
          >
            View Profile
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
