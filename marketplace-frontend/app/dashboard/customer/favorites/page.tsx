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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} saved
          </p>
        </div>

        {vendors.length > 0 && (
          /* Search Bar */
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <button
                    onClick={() => handleRemoveFavorite(vendor.slug)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                  
                  <Link href={`/vendors/${vendor.slug}`}>
                    <CardContent className="p-0">
                      {/* Vendor Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
                        {vendor.profileImage ? (
                          <img
                            src={vendor.profileImage}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-white">
                              {vendor.businessName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vendor Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                          {vendor.businessName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {vendor.vendorType}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {vendor.city}, {vendor.state}
                          </span>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="font-medium">{vendor.rating}</span>
                            <span className="text-gray-400 ml-1">
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
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {searchQuery ? 'No favorites found' : 'No favorite vendors yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Start adding vendors to your favorites to see them here'}
              </p>
              {!searchQuery && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  asChild
                >
                  <Link href="/explore">
                    Explore Vendors
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
