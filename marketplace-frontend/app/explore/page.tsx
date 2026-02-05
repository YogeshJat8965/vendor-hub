'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PremiumVendorCard } from '@/components/cards/PremiumVendorCard';
import { VendorCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data - will be replaced with API
const mockVendors = [
  {
    id: '1',
    slug: 'johns-plumbing',
    businessName: "John's Plumbing Services",
    category: 'Plumbing',
    city: 'New York',
    state: 'NY',
    rating: 4.8,
    reviewCount: 127,
    description: 'Professional plumbing services with 15+ years of experience. Emergency services available 24/7.',
    isCertified: true,
    isPromoted: true,
    yearsInBusiness: 15,
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
    description: 'Licensed electricians specializing in residential and commercial electrical work.',
    isCertified: true,
    yearsInBusiness: 10,
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
    description: 'Interior and exterior painting services with a focus on quality and customer satisfaction.',
    yearsInBusiness: 8,
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
    description: 'Complete landscaping services including design, installation, and maintenance.',
    isCertified: true,
    isPromoted: true,
    yearsInBusiness: 12,
  },
];

const categories = [
  'All Categories',
  'Plumbing',
  'Electrical',
  'Painting',
  'Landscaping',
  'Carpentry',
  'HVAC',
  'Roofing',
  'Cleaning',
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'newest', label: 'Newest' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [isLoading, setIsLoading] = useState(false);

  // Mock loading state
  const vendors = mockVendors;

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Search Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Explore Vendors
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8">
                Find the perfect service provider for your needs
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for services or vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 text-gray-900"
                    />
                  </div>
                  <div className="relative sm:w-48">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder="Location"
                      className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 text-gray-900"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8 text-lg touch-target"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Filter Bar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="touch-target sm:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="touch-target">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="touch-target">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Sort By</label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                          <SelectTrigger className="touch-target">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="touch-target">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop Filters */}
                <div className="hidden sm:flex gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="touch-target">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="w-48 touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="touch-target">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{vendors.length}</span> vendors
              </p>
            </div>

            {/* Vendors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {vendors.map((vendor, index) => (
                  <PremiumVendorCard key={vendor.id} vendor={vendor} index={index} />
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && vendors.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No vendors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
