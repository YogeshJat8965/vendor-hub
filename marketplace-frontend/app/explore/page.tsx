'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  X,
  Award,
  Shield,
  Clock,
  TrendingUp,
  Star,
  CheckCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PremiumVendorCard } from '@/components/cards/PremiumVendorCard';
import { VendorCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
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

interface Vendor {
  id: string;
  slug: string;
  storeName: string;
  businessName?: string;
  vendorType: string;
  city?: string;
  state?: string;
  rating?: number;
  reviewCount?: number;
  status: string;
  subscriptionPlan?: string;
}

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

const features = [
  {
    icon: Shield,
    title: 'Verified Vendors',
    description: 'All professionals are background checked',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Star,
    title: 'Top Rated',
    description: 'Read reviews from real customers',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get quotes within 24 hours',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Award,
    title: 'Best Quality',
    description: 'Premium service guaranteed',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  // Fetch vendors from API
  useEffect(() => {
    fetchVendors();
  }, []);

  // Apply filters when search/category changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, locationQuery, selectedCategory, vendors]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/explore');
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors. Please try again.');
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    // Filter by search query (search in storeName, businessName, vendorType)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.storeName?.toLowerCase().includes(query) ||
          v.businessName?.toLowerCase().includes(query) ||
          v.vendorType?.toLowerCase().includes(query)
      );
    }

    // Filter by location (city)
    if (locationQuery.trim()) {
      const location = locationQuery.toLowerCase();
      filtered = filtered.filter((v) => v.city?.toLowerCase().includes(location));
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(
        (v) => v.vendorType?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort vendors
    if (selectedSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === 'reviews') {
      filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    setFilteredVendors(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* Hero Search Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 sm:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Find Your Perfect{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                    Service Provider
                  </span>
                </h1>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-3 shadow-xl border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for services or vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-base border-0 focus-visible:ring-0 text-gray-900 bg-gray-50"
                    />
                  </div>
                  <div className="relative sm:w-56">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder="City or Location"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-base border-0 focus-visible:ring-0 text-gray-900 bg-gray-50"
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8 text-base font-semibold touch-target shadow-lg"
                  >
                    Search
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="touch-target sm:hidden shadow-sm">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filter Options</SheetTitle>
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
                    <SelectTrigger className="w-52 touch-target bg-white border-2 border-gray-300 hover:border-blue-500 transition-colors font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                      {categories.map((cat) => (
                        <SelectItem 
                          key={cat} 
                          value={cat} 
                          className="touch-target font-medium hover:bg-blue-50 cursor-pointer py-2.5"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="w-52 touch-target bg-white border-2 border-gray-300 hover:border-blue-500 transition-colors font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                      {sortOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="touch-target font-medium hover:bg-blue-50 cursor-pointer py-2.5"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {(searchQuery || locationQuery || selectedCategory !== 'All Categories') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setLocationQuery('');
                      setSelectedCategory('All Categories');
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-blue-600 font-bold">{filteredVendors.length}</span> {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
                </p>
              </div>
            </div>

            {/* Vendors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredVendors.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredVendors.map((vendor, index) => (
                  <PremiumVendorCard 
                    key={vendor.id} 
                    vendor={{
                      ...vendor,
                      businessName: vendor.businessName || vendor.storeName,
                      category: vendor.vendorType,
                      description: '',
                      logoUrl: '',
                      bannerUrl: '',
                      city: vendor.city || '',
                      state: vendor.state || '',
                      rating: vendor.rating || 0,
                      reviewCount: vendor.reviewCount || 0
                    }} 
                    index={index} 
                  />
                ))}
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">No vendors found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any vendors matching your criteria. Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationQuery('');
                      setSelectedCategory('All Categories');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Page
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
