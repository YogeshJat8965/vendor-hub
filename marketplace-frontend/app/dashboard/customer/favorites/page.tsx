'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Vendor {
  slug: string;
  businessName: string;
  vendorType: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
}

export default function CustomerFavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteVendors();
  }, []);

  const fetchFavoriteVendors = async () => {
    try {
      setIsLoading(true);
      const favorites = localStorage.getItem('favorites');
      if (!favorites) {
        setVendors([]);
        return;
      }

      const slugs = favorites.split(',').filter(Boolean);
      if (slugs.length === 0) {
        setVendors([]);
        return;
      }

      // Fetch vendor details for each slug
      const vendorPromises = slugs.map(slug =>
        apiClient.get(`/explore/${slug}/profile`).catch(() => null)
      );
      
      const results = await Promise.all(vendorPromises);
      const validVendors = results
        .filter(res => res !== null)
        .map(res => res.data);
      
      setVendors(validVendors);
    } catch (error) {
      console.error('Failed to fetch favorite vendors:', error);
      toast.error('Failed to load favorite vendors');
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = (slug: string) => {
    const favorites = localStorage.getItem('favorites') || '';
    const slugs = favorites.split(',').filter(Boolean);
    const newSlugs = slugs.filter(s => s !== slug);
    localStorage.setItem('favorites', newSlugs.join(','));
    
    setVendors(prevVendors => prevVendors.filter(v => v.slug !== slug));
    toast.success('Removed from favorites');
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.vendorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-20 px-4 rounded-3xl">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-2">My Favorites</h1>
          <p className="text-[#6B5E54] font-body">
            {vendors.length} {vendors.length === 1 ? 'professional' : 'professionals'} saved
          </p>
        </div>

        {vendors.length > 0 && (
          /* Search Bar */
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8E82] hover:text-[#6B5E54]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendors Grid */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-warm-lg transition-all duration-300 relative overflow-hidden border-[#CDC0B0] bg-white rounded-3xl h-full flex flex-col">
                  <button
                    onClick={() => handleRemoveFavorite(vendor.slug)}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-[#B85C5C] hover:bg-white hover:text-[#A34F4F] transition-all shadow-warm-sm border border-[#CDC0B0]/50"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                  
                  <Link href={`/vendors/${vendor.slug}`} className="flex-1 flex flex-col">
                    <CardContent className="p-0 flex-1 flex flex-col">
                      {/* Vendor Image */}
                      <div className="relative h-48 bg-[#EEDDCC] overflow-hidden border-b border-[#CDC0B0]/30">
                        {vendor.profileImage ? (
                          <img
                            src={vendor.profileImage}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl font-heading font-bold text-[#CDB79E]">
                              {vendor.businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vendor Info */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-2 group-hover:text-[#6B5E54] transition-colors line-clamp-1">
                          {vendor.businessName}
                        </h3>
                        <p className="text-[#6B5E54] font-body mb-4 flex-1">
                          {vendor.vendorType}
                        </p>
                        <div className="flex items-center justify-between text-sm font-body mt-auto">
                          <span className="text-[#9C8E82] truncate pr-4">
                            {vendor.city}, {vendor.state}
                          </span>
                          <div className="flex items-center flex-shrink-0 bg-[#FDFBF7] px-2 py-1 rounded-lg border border-[#CDC0B0]/30">
                            <span className="text-[#C4975A] mr-1">★</span>
                            <span className="font-medium text-[#2C2621]">{vendor.rating}</span>
                            <span className="text-[#9C8E82] ml-1">
                              ({vendor.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#EEDDCC]/50 border border-[#CDC0B0]/50 flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#CDB79E]" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#2C2621] mb-2">
                {searchQuery ? 'No professionals found' : 'No saved professionals yet'}
              </h3>
              <p className="font-body text-[#6B5E54] mb-8 max-w-md mx-auto">
                {searchQuery
                  ? 'Try adjusting your search terms to find who you\'re looking for.'
                  : 'Start adding professionals to your favorites to keep track of ones you like.'}
              </p>
              {!searchQuery && (
                <Button
                  size="lg"
                  className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] rounded-xl font-body px-8"
                  asChild
                >
                  <Link href="/explore">
                    Explore Professionals
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
