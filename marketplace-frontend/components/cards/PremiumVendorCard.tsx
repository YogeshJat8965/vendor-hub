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
      className="group bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-warm-sm hover:shadow-warm-xl border border-[#CDC0B0]/30 transition-all duration-300"
    >
      <Link href={`/vendors/${slug}`}>
        {/* Banner Image */}
        <div className="relative h-48 bg-[#EEDDCC] overflow-hidden">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={`${businessName} banner`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-[#EEDDCC]" />
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isPromoted && (
              <Badge className="bg-[#2C2621] text-[#EEDDCC] border-0 touch-target shadow-warm-sm">
                <TrendingUp className="w-3 h-3 mr-1 text-[#CDB79E]" />
                Featured
              </Badge>
            )}
            {isCertified && (
              <Badge className="bg-[#EEDDCC] text-[#2C2621] border-0 touch-target shadow-warm-sm">
                <BadgeCheck className="w-3 h-3 mr-1 text-[#5B8C5A]" />
                Verified
              </Badge>
            )}
          </div>

          {/* Logo Overlay */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-warm-md overflow-hidden border-4 border-white">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${businessName} logo`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-[#EEDDCC] flex items-center justify-center text-[#2C2621] text-2xl font-heading font-bold">
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
            <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-1 group-hover:text-[#C4975A] transition-colors line-clamp-1">
              {businessName}
            </h3>
            <p className="text-sm font-body text-[#9C8E82] font-medium">{category}</p>
          </div>

          {/* Rating & Location */}
          <div className="flex items-center justify-between mb-4 font-body text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#C4975A] text-[#C4975A]" />
              <span className="font-semibold text-[#2C2621]">{rating.toFixed(1)}</span>
              <span className="text-[#9C8E82]">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-[#6B5E54]">
              <MapPin className="w-4 h-4 text-[#CDB79E]" />
              <span className="line-clamp-1">{city}, {state}</span>
            </div>
          </div>

          {/* Description */}
          <p className="font-body text-[#6B5E54] text-sm mb-6 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Experience Badge */}
          {yearsInBusiness && yearsInBusiness > 0 && (
            <div className="mb-6">
              <Badge variant="outline" className="text-xs font-body border-[#CDC0B0] text-[#6B5E54]">
                {yearsInBusiness}+ years in business
              </Badge>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="w-full bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] font-body rounded-xl touch-target group/btn"
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
