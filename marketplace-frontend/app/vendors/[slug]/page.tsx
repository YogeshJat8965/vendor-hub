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

interface Vendor {
  id: string;
  slug: string;
  storeName: string;
  businessName?: string;
  vendorType: string;
  description?: string;
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
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchVendorData();
    }
  }, [slug]);

  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      // Fetch vendor profile
      const vendorResponse = await apiClient.get(`/explore/${slug}/profile`);
      setVendor(vendorResponse.data);
      
      // Fetch vendor reviews
      try {
        const reviewsResponse = await apiClient.get(`/reviews/${slug}`);
        setReviews(reviewsResponse.data || []);
      } catch (reviewError) {
        console.log('No reviews found:', reviewError);
        setReviews([]);
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
      
      <main className="min-h-screen bg-gray-50">
        {/* Banner Section */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-blue-500 to-purple-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full touch-target"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full touch-target">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          {/* Vendor Info Card */}
          <div className="relative -mt-24 sm:-mt-32 mb-8">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                    {displayName.charAt(0)}
                  </div>
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
                        <Badge variant="outline" className="text-sm">
                          {vendor.vendorType}
                        </Badge>
                        {vendor.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      onClick={() => setShowQuoteDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Request Quote
                    </Button>
                    {vendor.mobile && (
                      <Button size="lg" variant="outline" className="touch-target" asChild>
                        <a href={`tel:${vendor.mobile}`}>
                          <Phone className="w-5 h-5 mr-2" />
                          Call Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3 touch-target">
                  <TabsTrigger value="about" className="touch-target">About</TabsTrigger>
                  <TabsTrigger value="gallery" className="touch-target">Gallery</TabsTrigger>
                  <TabsTrigger value="reviews" className="touch-target">Reviews</TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">About Us</h2>
                      <div className="prose max-w-none">
                        {vendor.description ? (
                          <p className="text-gray-700 whitespace-pre-line">{vendor.description}</p>
                        ) : (
                          <p className="text-gray-500">No description available.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                      <div className="text-center py-12">
                        <p className="text-gray-500">No gallery images available yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Customer Reviews</h2>
                        {vendor.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{vendor.rating.toFixed(1)}</span>
                            <span className="text-gray-600">({vendor.reviewCount || 0})</span>
                          </div>
                        )}
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
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{review.customerName}</h4>
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {vendor.mobile && (
                      <a
                        href={`tel:${vendor.mobile}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>{vendor.mobile}</span>
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="break-all">{vendor.email}</span>
                      </a>
                    )}
                    {vendor.website && (
                      <a
                        href={`https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>{vendor.website}</span>
                      </a>
                    )}
                    {vendor.address && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>{vendor.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription</span>
                      <span className="font-semibold">{vendor.subscriptionPlan || 'BASIC'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{vendor.reviewCount || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">{vendor.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Quote Request Dialog */}
      <QuoteRequestDialog
        open={showQuoteDialog}
        onOpenChange={setShowQuoteDialog}
        vendorSlug={vendor.slug}
        vendorName={displayName}
      />

      <Footer />
    </>
  );
}
