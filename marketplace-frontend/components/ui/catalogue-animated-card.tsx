'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CatalogueAnimatedCardProps {
  catalogue: any;
}

export function CatalogueAnimatedCard({ catalogue }: CatalogueAnimatedCardProps) {
  // Extract up to 5 images from the catalogue
  const allImages = [
    catalogue.coverImage,
    ...(catalogue.items || []).flatMap((item: any) => item.images || [])
  ].filter(Boolean);
  
  // Dedup and limit to 5
  const images = Array.from(new Set(allImages)).slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds for smooth crossfade
    
    return () => clearInterval(interval);
  }, [images.length]);

  // Calculate a minimal starting price from items
  const minPrice = catalogue.items?.reduce((min: number, item: any) => {
    if (item.startingPrice && item.startingPrice > 0) {
      return min === 0 ? item.startingPrice : Math.min(min, item.startingPrice);
    }
    return min;
  }, 0);

  return (
    <Link href={`/catalogues/${catalogue.id}`} className="block group">
      <div className="rounded-3xl border border-[#CDC0B0] bg-white overflow-hidden hover:shadow-warm-lg transition-all duration-300">
        <div className="aspect-[4/3] bg-black relative overflow-hidden">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${catalogue.name} - Image ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#9C8E82]">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-body">No images</span>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-[#C4975A]' : 'w-1.5 bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-heading font-bold text-xl text-[#2C2621] line-clamp-1 group-hover:text-[#C4975A] transition-colors">{catalogue.name}</h3>
              <p className="text-[#6B5E54] text-sm font-body mt-1 line-clamp-2">
                {catalogue.description || `${catalogue.items?.length || 0} items`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#CDC0B0]/50">
            {minPrice > 0 ? (
              <div className="text-sm font-body">
                <span className="text-[#9C8E82]">Starting at</span>
                <span className="block font-bold text-[#2C2621]">₹{minPrice.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <div className="text-sm font-body text-[#9C8E82]">
                {catalogue.items?.length || 0} Items
              </div>
            )}
            
            <Button variant="ghost" className="text-[#C4975A] hover:text-[#B38549] hover:bg-[#EEDDCC]/30 font-body rounded-xl px-4">
              View Details <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
