'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  BadgeCheck,
  Award,
  Share2,
  Heart,
  MessageSquare,
  Loader2,
  Layers,
  Image as ImageIcon,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  PenLine
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { QuoteRequestDialog } from '@/components/dialogs/QuoteRequestDialog';
import { AuthRequiredDialog } from '@/components/dialogs/AuthRequiredDialog';
import { ShareDialog } from '@/components/dialogs/ShareDialog';
import { WriteReviewDialog } from '@/components/dialogs/WriteReviewDialog';
import { useAuth } from '@/lib/auth-context';
import { CatalogueAnimatedCard } from '@/components/ui/catalogue-animated-card';

interface Vendor {
  id: string;
  slug: string;
  storeName: string;
  businessName?: string;
  ownerName?: string;
  vendorType: string;
  category?: string;
  description?: string;
  longDescription?: string;
  city?: string;
  state?: string;
  address?: string;
  mobile?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  status: string;
  subscriptionPlan?: string;
  yearsInBusiness?: number;
  services?: string[];
  gallery?: string[];
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  flagged?: boolean;
}

interface VendorQuoteStats {
  pendingQuotes: number;
  activeQuotes: number;
  completedQuotes: number;
  totalQuotes: number;
}

function VendorStatTile({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconClassName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/60 bg-gradient-to-br from-white to-[#FAF8F5] px-4 py-3 shadow-warm-sm min-w-[84px]">
      <Icon className={`w-5 h-5 ${iconClassName}`} />
      <span className="text-xl font-bold text-[#2C2621]">{value}</span>
      <span className="text-xs text-[#8C837A] text-center leading-tight">{label}</span>
    </div>
  );
}

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quoteStats, setQuoteStats] = useState<VendorQuoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  
  // Dialogs
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showWriteReviewDialog, setShowWriteReviewDialog] = useState(false);
  
  // Catalogue Quote Context
  // Catalogue Quote Context
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>();
  const [selectedCatalogueItemId, setSelectedCatalogueItemId] = useState<string>();
  const [quoteServiceType, setQuoteServiceType] = useState<string>();
  const [quoteDescription, setQuoteDescription] = useState<string>();

  useEffect(() => {
    if (slug) {
      fetchVendorData();
      const favorites = localStorage.getItem('favorites') || '';
      const slugs = favorites.split(',').filter(Boolean);
      setIsLiked(slugs.includes(slug));
    }
  }, [slug]);

  const handleQuoteRequest = (catalogueId?: string, itemId?: string, title?: string, desc?: string) => {
    if (!user) {
      setAuthMessage('Please log in to request a quote from this vendor.');
      setShowAuthDialog(true);
      return;
    }
    setSelectedCatalogueId(catalogueId);
    setSelectedCatalogueItemId(itemId);
    setQuoteServiceType(title);
    setQuoteDescription(desc);
    setShowQuoteDialog(true);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      setAuthMessage('Please log in to save this vendor to your favorites.');
      setShowAuthDialog(true);
      return;
    }

    const favorites = localStorage.getItem('favorites') || '';
    let slugs = favorites.split(',').filter(Boolean);
    
    if (isLiked) {
      slugs = slugs.filter(s => s !== slug);
      toast.success('Removed from favorites');
    } else {
      if (!slugs.includes(slug)) {
        slugs.push(slug);
      }
      toast.success('Added to favorites');
    }
    
    localStorage.setItem('favorites', slugs.join(','));
    setIsLiked(!isLiked);
  };

  const handleWriteReview = () => {
    if (!user) {
      setAuthMessage('Please log in as a customer to write a review for this vendor.');
      setShowAuthDialog(true);
      return;
    }
    setShowWriteReviewDialog(true);
  };

  const refetchReviews = async () => {
    try {
      const reviewsResponse = await apiClient.get(`/reviews/${slug}`);
      setReviews(reviewsResponse.data || []);
    } catch (e) {
      console.log('Failed to refresh reviews:', e);
    }
  };

  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      // Fetch vendor profile
      const vendorResponse = await apiClient.get(`/explore/${slug}/profile`);
      setVendor(vendorResponse.data);
      const vendorId = vendorResponse.data.id;
      
      // Fetch catalogues
      try {
        const catRes = await apiClient.get(`/catalogues/vendor/${vendorId}`);
        setCatalogues(catRes.data || []);
      } catch(e) {
        console.log('No catalogues found');
      }
      
      // Fetch vendor reviews
      try {
        const reviewsResponse = await apiClient.get(`/reviews/${slug}`);
        setReviews(reviewsResponse.data || []);
      } catch (reviewError) {
        console.log('No reviews found:', reviewError);
        setReviews([]);
      }

      // Fetch quote activity stats (counts only — safe to show publicly)
      try {
        const statsResponse = await apiClient.get(`/explore/${slug}/stats`);
        setQuoteStats(statsResponse.data);
      } catch (statsError) {
        console.log('No quote stats available:', statsError);
        setQuoteStats(null);
      }
    } catch (error) {
      console.error('Failed to fetch vendor data:', error);
      toast.error('Failed to load vendor profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading vendor profile...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
            <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/explore">Browse Vendors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayName = vendor.businessName || vendor.storeName;

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 relative pb-10">
        {/* Banner Section */}
        <div className="absolute top-0 left-0 right-0 h-[70vh] lg:h-[85vh] bg-[#2C2621] overflow-hidden z-0">
          {vendor.bannerUrl ? (
            <img src={vendor.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#5C5346] to-[#2C2621] opacity-90" />
          )}
          {/* Subtle gradient overlay for better text/card contrast at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/20" />
        </div>
          
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-3 z-20">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full touch-target shadow-md bg-white/80 hover:bg-white backdrop-blur-sm transition-all"
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full touch-target shadow-md bg-white/80 hover:bg-white backdrop-blur-sm transition-all"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </Button>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-6 sm:pt-10">
          {/* Main Content Area (Wrapped in Tabs) */}
          <Tabs defaultValue="catalogues" className="max-w-5xl mx-auto pb-24 w-full">
            {/* Unified Single Profile Card */}
            <Card className="rounded-3xl shadow-2xl border-white/60 bg-white/95 backdrop-blur-md overflow-hidden">
              <div className="p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 sm:items-center">
                  {/* Logo */}
                  <div className="flex-shrink-0 z-10 relative">
                    {vendor.logoUrl ? (
                      <img src={vendor.logoUrl} alt="Logo" className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white bg-white" />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white">
                        {displayName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-3xl sm:text-4xl font-bold">{displayName}</h1>
                          {vendor.subscriptionPlan !== 'BASIC' && (
                            <BadgeCheck className="w-8 h-8 text-blue-600" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-gray-600">
                          {vendor.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {quoteStats && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#8C837A] mb-2 text-center sm:text-left">
                            Quote Activity
                          </p>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <VendorStatTile
                              icon={Clock}
                              label="Pending"
                              value={quoteStats.pendingQuotes}
                              iconClassName="text-amber-600"
                            />
                            <VendorStatTile
                              icon={TrendingUp}
                              label="Active"
                              value={quoteStats.activeQuotes}
                              iconClassName="text-blue-600"
                            />
                            <VendorStatTile
                              icon={CheckCircle2}
                              label="Completed"
                              value={quoteStats.completedQuotes}
                              iconClassName="text-green-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mb-6">
                      {vendor.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">{vendor.rating.toFixed(1)}</span>
                          <span className="text-gray-600">({vendor.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="text-gray-900">{vendor.subscriptionPlan || 'BASIC'} Plan</span>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                      <Button
                        size="lg"
                        onClick={() => {
                          setSelectedCatalogueId(undefined);
                          setSelectedCatalogueItemId(undefined);
                          setQuoteServiceType(undefined);
                          setQuoteDescription(undefined);
                          setShowQuoteDialog(true);
                        }}
                        className="bg-gradient-to-r from-[#8B7355] to-[#5C5346] hover:from-[#5C5346] hover:to-[#2C2621] text-white shadow-md hover:shadow-lg transition-all rounded-xl h-12 px-8 touch-target"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Request Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Options Bar Integrated */}
              <div className="px-4 sm:px-10 pb-4 border-b border-[#E8E2D9]/60">
                <TabsList className="grid w-full grid-cols-4 touch-target bg-gray-100/60 shadow-inner p-1.5 rounded-2xl">
                  <TabsTrigger value="catalogues" className="touch-target rounded-xl font-medium data-[state=active]:bg-[#8B7355] data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3">Catalogues</TabsTrigger>
                  <TabsTrigger value="about" className="touch-target rounded-xl font-medium data-[state=active]:bg-[#8B7355] data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3">About</TabsTrigger>
                  <TabsTrigger value="gallery" className="touch-target rounded-xl font-medium data-[state=active]:bg-[#8B7355] data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3">Gallery</TabsTrigger>
                  <TabsTrigger value="reviews" className="touch-target rounded-xl font-medium data-[state=active]:bg-[#8B7355] data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3">Reviews</TabsTrigger>
                </TabsList>
              </div>

            <div className="w-full bg-white/50">

                {/* Catalogues Tab */}
                <TabsContent value="catalogues" className="m-0 px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-6">
                  <div className="w-full">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-600" /> Catalogues & Services
                      </h2>
                      {catalogues.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No catalogues available yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {catalogues.map(catalogue => (
                            <CatalogueAnimatedCard key={catalogue.id} catalogue={catalogue} />
                          ))}
                        </div>
                      )}
                  </div>
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="m-0 px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 min-w-0">
                      <div className="p-2">
                        <h2 className="text-2xl font-bold mb-6 font-heading text-[#2C2621]">About Us</h2>
                        <div className="prose max-w-none text-[#5C5346] leading-relaxed break-words">
                          {vendor.description ? (
                            <p className="whitespace-pre-line text-lg break-words">{vendor.description}</p>
                          ) : (
                            <p className="italic">No description available.</p>
                          )}
                          {vendor.longDescription && (
                            <p className="whitespace-pre-line text-base mt-4 break-words">{vendor.longDescription}</p>
                          )}
                        </div>

                        {vendor.services && vendor.services.length > 0 && (
                          <div className="mt-8 border-t border-[#E8E2D9] pt-6">
                            <h3 className="text-xl font-bold mb-4 font-heading text-[#2C2621]">Services & Specialities</h3>
                            <div className="flex flex-wrap gap-2">
                              {vendor.services.map((service, index) => (
                                <Badge key={index} variant="secondary" className="bg-[#F2ECE4] text-[#5C5346] hover:bg-[#E8E2D9] px-4 py-1.5 text-sm rounded-full">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-2xl border border-white/60 shadow-warm-sm bg-gradient-to-br from-white to-[#FAF8F5] p-6 space-y-6">
                          <h3 className="font-bold text-[#2C2621] text-xl border-b border-[#E8E2D9] pb-3">Business Details</h3>
                          
                          {vendor.ownerName && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                                <span className="text-[#8B7355] font-bold text-lg">{vendor.ownerName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-sm text-[#8C837A]">Owner</p>
                                <p className="font-medium text-[#2C2621]">{vendor.ownerName}</p>
                              </div>
                            </div>
                          )}

                          {vendor.yearsInBusiness !== undefined && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-[#8B7355]" />
                              </div>
                              <div>
                                <p className="text-sm text-[#8C837A]">Experience</p>
                                <p className="font-medium text-[#2C2621]">{vendor.yearsInBusiness} Years</p>
                              </div>
                            </div>
                          )}

                          {vendor.vendorType && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                                <BadgeCheck className="w-6 h-6 text-[#8B7355]" />
                              </div>
                              <div>
                                <p className="text-sm text-[#8C837A]">Type</p>
                                <p className="font-medium text-[#2C2621]">{vendor.vendorType}</p>
                              </div>
                            </div>
                          )}

                          {vendor.category && vendor.category !== vendor.vendorType && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                                <Layers className="w-6 h-6 text-[#8B7355]" />
                              </div>
                              <div>
                                <p className="text-sm text-[#8C837A]">Category</p>
                                <p className="font-medium text-[#2C2621]">{vendor.category}</p>
                              </div>
                            </div>
                          )}

                          {vendor.address && (
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6 text-[#8B7355]" />
                              </div>
                              <div>
                                <p className="text-sm text-[#8C837A]">Location</p>
                                <p className="font-medium text-[#2C2621] leading-tight mt-1">{vendor.address}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#F2ECE4] flex items-center justify-center shrink-0">
                              <Award className="w-6 h-6 text-[#8B7355]" />
                            </div>
                            <div>
                              <p className="text-sm text-[#8C837A]">Plan</p>
                              <p className="font-medium text-[#2C2621]">{vendor.subscriptionPlan || 'BASIC'}</p>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="m-0 px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-6">
                  <div className="w-full">
                      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                      {!vendor.gallery || vendor.gallery.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-gray-500">No gallery images available yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {vendor.gallery.map((url: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              <img src={url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="m-0 px-6 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-6">
                  <div className="w-full">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold">Customer Reviews</h2>
                        <div className="flex items-center gap-4">
                          {vendor.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                              <span className="text-2xl font-bold">{vendor.rating.toFixed(1)}</span>
                              <span className="text-gray-600">({vendor.reviewCount || 0})</span>
                            </div>
                          )}
                          {(!user || user.role?.toLowerCase() === 'customer') && (
                            <Button
                              onClick={handleWriteReview}
                              variant="outline"
                              className="rounded-xl border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC]/40 font-body touch-target"
                            >
                              <PenLine className="w-4 h-4 mr-2" />
                              Write a Review
                            </Button>
                          )}
                        </div>
                      </div>

                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map((review, index) => (
                            <div key={review.id}>
                              {index > 0 && <Separator className="my-6" />}
                              <div className="flex gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {review.customerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{review.customerName}</h4>
                                      {review.verifiedPurchase && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8A9A5B] bg-[#8A9A5B]/10 px-2 py-0.5 rounded-full">
                                          <ShieldCheck className="w-3 h-3" /> Verified
                                        </span>
                                      )}
                                      {review.flagged && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                          <AlertTriangle className="w-3 h-3" /> Under review
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </TabsContent>
            </div>
            </Card>
          </Tabs>
        </div>
      </main>

      {/* Quote Request Dialog */}
      <QuoteRequestDialog
        open={showQuoteDialog}
        onOpenChange={setShowQuoteDialog}
        vendorSlug={vendor.slug}
        vendorName={displayName}
        catalogueId={selectedCatalogueId}
        catalogueItemId={selectedCatalogueItemId}
        initialServiceType={quoteServiceType}
        initialDescription={quoteDescription}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`Share ${displayName}`}
      />

      {/* Auth Required Dialog (favorites, quote requests, reviews) */}
      <AuthRequiredDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        message={authMessage}
      />

      {/* Write Review Dialog */}
      <WriteReviewDialog
        isOpen={showWriteReviewDialog}
        onClose={() => setShowWriteReviewDialog(false)}
        vendorSlug={vendor.slug}
        vendorName={displayName}
        onSubmitted={refetchReviews}
      />

      <Footer />
    </>
  );
}
