'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Heart } from 'lucide-react';
import { FavoriteVendorCard } from '@/components/cards/FavoriteVendorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// Mock data - will be replaced with API
const mockFavorites = [
  {
    id: '1',
    slug: 'johns-plumbing',
    businessName: 'Johns Plumbing Services',
    category: 'Plumbing',
    city: 'New York',
    state: 'NY',
    rating: 4.8,
    reviewCount: 127,
    lastContacted: '2 weeks ago',
    isCertified: true,
  },
  {
    id: '2',
    slug: 'elite-electric',
    businessName: 'Elite Electrical Solutions',
    category: 'Electrical',
    city: 'Los Angeles',
    state: 'CA',
    rating: 4.9,
    reviewCount: 203,
    lastContacted: '1 month ago',
    isCertified: true,
  },
  {
    id: '3',
    slug: 'perfect-painting',
    businessName: 'Perfect Painting Co',
    category: 'Painting',
    city: 'Chicago',
    state: 'IL',
    rating: 4.7,
    reviewCount: 89,
    isCertified: false,
  },
  {
    id: '4',
    slug: 'green-landscaping',
    businessName: 'Green Thumb Landscaping',
    category: 'Landscaping',
    city: 'Houston',
    state: 'TX',
    rating: 4.6,
    reviewCount: 156,
    lastContacted: '3 days ago',
    isCertified: true,
  },
];

const categories = ['All Categories', 'Plumbing', 'Electrical', 'Painting', 'Landscaping', 'Carpentry', 'HVAC'];

export default function CustomerFavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [favorites, setFavorites] = useState(mockFavorites);

  const handleRemoveFavorite = (vendorId: string) => {
    // TODO: Call API to remove favorite
    setFavorites(favorites.filter(f => f.id !== vendorId));
    console.log('Remove favorite:', vendorId);
  };

  const handleRequestQuote = (vendorId: string) => {
    // TODO: Open request quote modal
    console.log('Request quote from vendor:', vendorId);
  };

  // Filter favorites
  const filteredFavorites = favorites.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-gray-600">Your saved vendors for quick access</p>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 touch-target"
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

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="touch-target">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredFavorites.length}</span> vendors
        </p>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((vendor, index) => (
            <FavoriteVendorCard
              key={vendor.id}
              vendor={vendor}
              onRemove={handleRemoveFavorite}
              onRequestQuote={handleRequestQuote}
              index={index}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery || selectedCategory !== 'All Categories'
                ? 'No vendors found'
                : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'All Categories'
                ? 'Try adjusting your search or filters'
                : 'Start adding vendors to your favorites for quick access'}
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
              onClick={() => window.location.href = '/explore'}
            >
              Explore Vendors
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
