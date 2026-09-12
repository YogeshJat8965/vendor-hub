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
  CheckCircle,
  LocateFixed
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PremiumVendorCard } from '@/components/cards/PremiumVendorCard';
import { VendorCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { LocationPermissionDialog } from '@/components/dialogs/LocationPermissionDialog';
import { detectUserCity, GeolocationDeniedError } from '@/lib/geolocation';
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

const LOCATION_PROMPTED_KEY = 'vh_location_prompted';
const USER_CITY_KEY = 'vh_user_city';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  // Nearby-first location detection
  const [userCity, setUserCity] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Fetch vendors from API & scroll to top instantly
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetchVendors();
  }, []);

  // On arrival: reuse a city already detected this session, or prompt once
  // for location permission so nearby vendors can surface first.
  useEffect(() => {
    const storedCity = sessionStorage.getItem(USER_CITY_KEY);
    if (storedCity) {
      setUserCity(storedCity);
      return;
    }

    const alreadyPrompted = sessionStorage.getItem(LOCATION_PROMPTED_KEY);
    if (!alreadyPrompted && typeof navigator !== 'undefined' && navigator.geolocation) {
      const timer = setTimeout(() => {
        sessionStorage.setItem(LOCATION_PROMPTED_KEY, '1');
        setShowLocationDialog(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleShareLocation = async () => {
    setIsLocating(true);
    try {
      const { city } = await detectUserCity();
      setUserCity(city);
      sessionStorage.setItem(USER_CITY_KEY, city);
      toast.success(`Showing vendors near ${city} first`);
      setShowLocationDialog(false);
    } catch (error) {
      if (error instanceof GeolocationDeniedError) {
        toast.info('Location access denied. Showing all vendors.');
      } else {
        toast.error('Could not detect your location. Showing all vendors.');
      }
      setShowLocationDialog(false);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClearLocation = () => {
    setUserCity(null);
    sessionStorage.removeItem(USER_CITY_KEY);
  };

  // Apply filters when search/category/sort/location changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, locationQuery, selectedCategory, selectedSort, vendors, userCity]);

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

    // Bring vendors in the customer's detected city to the front, in real
    // time, while keeping the order established above within each group
    // (Array.prototype.sort is a stable sort in all modern JS engines).
    if (userCity) {
      const city = userCity.toLowerCase();
      filtered = [...filtered].sort((a, b) => {
        const aNear = a.city?.toLowerCase() === city ? 0 : 1;
        const bNear = b.city?.toLowerCase() === city ? 0 : 1;
        return aNear - bNear;
      });
    }

    setFilteredVendors(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-[#FDFBF7] selection:bg-[#EEDDCC] selection:text-[#2C2621]">
        {/* Hero Search Section */}
        <section className="relative overflow-hidden pt-8 pb-8">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EEDDCC]/40 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#CDC0B0]/20 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
              {/* Heading */}
              <div className="text-center mb-6">
                <p className="font-accent text-2xl sm:text-3xl text-[#C4975A] mb-1">Discover Excellence</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#2C2621] leading-tight whitespace-nowrap">
                  Find Your Perfect <span className="text-[#9C8E82]">Design Partner</span>
                </h1>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-3 shadow-warm-lg border border-[#CDC0B0]/50"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82]" />
                    <Input
                      type="text"
                      placeholder="Search for interior designers, architects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-base font-body border border-[#CDC0B0]/40 focus-visible:ring-1 focus-visible:ring-[#C4975A] text-[#2C2621] bg-white rounded-2xl placeholder:text-[#9C8E82]"
                    />
                  </div>
                  <div className="relative sm:w-64">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C8E82] pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder="City or Location"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 text-base font-body border border-[#CDC0B0]/40 focus-visible:ring-1 focus-visible:ring-[#C4975A] text-[#2C2621] bg-white rounded-2xl placeholder:text-[#9C8E82]"
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] font-body h-14 px-10 text-base font-medium rounded-2xl touch-target transition-colors shadow-warm-sm"
                  >
                    Search
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-6 bg-white border-t border-[#CDC0B0]/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <div className="mb-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-2xl p-4 shadow-warm-sm border border-[#CDC0B0]/30">
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="touch-target sm:hidden font-body text-[#2C2621] border-[#CDC0B0] rounded-xl bg-white">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-white border-r-[#CDC0B0]/30">
                    <SheetHeader>
                      <SheetTitle className="font-heading text-[#2C2621]">Filter Options</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                      <div>
                        <label className="text-sm font-body font-medium mb-2 block text-[#6B5E54]">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="touch-target font-body border-[#CDC0B0] bg-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#CDC0B0] rounded-xl">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="font-body touch-target focus:bg-[#EEDDCC]/50 focus:text-[#2C2621]">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-body font-medium mb-2 block text-[#6B5E54]">Sort By</label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                          <SelectTrigger className="touch-target font-body border-[#CDC0B0] bg-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#CDC0B0] rounded-xl">
                            {sortOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="font-body touch-target focus:bg-[#EEDDCC]/50 focus:text-[#2C2621]">
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
                    <SelectTrigger className="w-56 touch-target bg-white border-[#CDC0B0] hover:border-[#9C8E82] transition-colors font-body rounded-xl text-[#2C2621]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#CDC0B0] shadow-warm-lg rounded-xl">
                      {categories.map((cat) => (
                        <SelectItem 
                          key={cat} 
                          value={cat} 
                          className="font-body touch-target focus:bg-[#EEDDCC]/50 focus:text-[#2C2621] cursor-pointer py-3"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="w-56 touch-target bg-white border-[#CDC0B0] hover:border-[#9C8E82] transition-colors font-body rounded-xl text-[#2C2621]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#CDC0B0] shadow-warm-lg rounded-xl">
                      {sortOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="font-body touch-target focus:bg-[#EEDDCC]/50 focus:text-[#2C2621] cursor-pointer py-3"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nearby-first location toggle */}
                {userCity ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearLocation}
                    className="bg-[#EEDDCC]/60 hover:bg-[#EEDDCC] text-[#2C2621] font-body rounded-xl touch-target"
                  >
                    <LocateFixed className="w-4 h-4 mr-1.5" />
                    Near {userCity}
                    <X className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLocation}
                    disabled={isLocating}
                    className="border-[#CDC0B0] text-[#6B5E54] hover:bg-[#EEDDCC]/30 hover:text-[#2C2621] font-body rounded-xl touch-target disabled:opacity-70"
                  >
                    <LocateFixed className={`w-4 h-4 mr-1.5 ${isLocating ? 'animate-pulse' : ''}`} />
                    {isLocating ? 'Locating...' : 'Use My Location'}
                  </Button>
                )}

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
                    className="text-[#6B5E54] hover:text-[#2C2621] hover:bg-[#EEDDCC]/30 font-body rounded-xl"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#CDB79E]" />
                <p className="font-body text-sm text-[#6B5E54]">
                  <span className="text-[#2C2621] font-semibold">{filteredVendors.length}</span> {filteredVendors.length === 1 ? 'professional' : 'professionals'} found
                </p>
              </div>
            </div>

            {/* Vendors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredVendors.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredVendors.map((vendor, index) => (
                  <PremiumVendorCard 
                    key={vendor.id} 
                    vendor={{
                      ...vendor,
                      businessName: vendor.businessName || vendor.storeName,
                      category: vendor.vendorType,
                      description: 'Exquisite designs tailored to your sophisticated taste. Transforming spaces into living art.',
                      logoUrl: vendor.logoUrl || '',
                      bannerUrl: vendor.bannerUrl || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600',
                      city: vendor.city || 'Mumbai',
                      state: vendor.state || 'MH',
                      rating: vendor.rating || 4.9,
                      reviewCount: vendor.reviewCount || 124,
                      isCertified: true,
                      yearsInBusiness: 5,
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
                className="text-center py-24 bg-white rounded-3xl border border-[#CDC0B0] shadow-warm-sm"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#EEDDCC]/50 flex items-center justify-center">
                  <Search className="w-10 h-10 text-[#9C8E82]" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-[#2C2621]">No professionals found</h3>
                <p className="font-body text-[#6B5E54] mb-8 max-w-md mx-auto">
                  We couldn't find any design partners matching your criteria. Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationQuery('');
                      setSelectedCategory('All Categories');
                    }}
                    className="bg-[#2C2621] hover:bg-[#3A332C] text-[#EEDDCC] font-body rounded-xl px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <LocationPermissionDialog
        isOpen={showLocationDialog}
        isLocating={isLocating}
        onShare={handleShareLocation}
        onDismiss={() => setShowLocationDialog(false)}
      />

      <Footer />
    </>
  );
}
