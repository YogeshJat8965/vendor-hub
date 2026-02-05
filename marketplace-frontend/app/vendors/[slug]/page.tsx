'use client';

import { useState } from 'react';
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

// Mock data
const vendor = {
  id: '1',
  slug: 'johns-plumbing',
  businessName: "John's Plumbing Services",
  category: 'Plumbing',
  description: 'Professional plumbing services with over 15 years of experience serving the New York area. We specialize in residential and commercial plumbing, including installations, repairs, and emergency services available 24/7.',
  longDescription: `We are a family-owned business committed to providing top-quality plumbing services to our community. Our team of licensed and insured plumbers brings expertise, professionalism, and dedication to every job, whether it's a simple repair or a complex installation.

Our services include:
• Emergency plumbing repairs
• Water heater installation and repair
• Drain cleaning and sewer line services
• Fixture installation and replacement
• Pipe repair and replacement
• Commercial plumbing services
• Regular maintenance and inspections

We pride ourselves on transparent pricing, quality workmanship, and exceptional customer service. All our work is guaranteed, and we stand behind every job we complete.`,
  city: 'New York',
  state: 'NY',
  address: '123 Main Street, New York, NY 10001',
  phone: '(555) 123-4567',
  email: 'contact@johnsplumbing.com',
  website: 'www.johnsplumbing.com',
  rating: 4.8,
  reviewCount: 127,
  isCertified: true,
  isPromoted: true,
  yearsInBusiness: 15,
  responseTime: '2 hours',
  completionRate: 98,
  gallery: [
    '/placeholder-1.jpg',
    '/placeholder-2.jpg',
    '/placeholder-3.jpg',
    '/placeholder-4.jpg',
  ],
  reviews: [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent service! John was professional, arrived on time, and fixed our emergency leak quickly. Highly recommend!',
      avatar: null,
    },
    {
      id: '2',
      customerName: 'Mike Williams',
      rating: 5,
      date: '2024-01-10',
      comment: 'Great experience from start to finish. Fair pricing and quality work. Will definitely use again.',
      avatar: null,
    },
    {
      id: '3',
      customerName: 'Emily Chen',
      rating: 4,
      date: '2024-01-05',
      comment: 'Very professional and knowledgeable. Job was completed efficiently. Only minor communication delay initially.',
      avatar: null,
    },
  ],
};

export default function VendorProfilePage() {
  const [isLiked, setIsLiked] = useState(false);

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
                    {vendor.businessName.charAt(0)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-bold">{vendor.businessName}</h1>
                        {vendor.isCertified && (
                          <BadgeCheck className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-gray-600">
                        <Badge variant="outline" className="text-sm">
                          {vendor.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{vendor.city}, {vendor.state}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{vendor.yearsInBusiness}+ years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{vendor.rating}</span>
                      <span className="text-gray-600">({vendor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900">{vendor.completionRate}% completion rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900">Responds in {vendor.responseTime}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Request Quote
                    </Button>
                    <Button size="lg" variant="outline" className="touch-target" asChild>
                      <a href={`tel:${vendor.phone}`}>
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </a>
                    </Button>
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
                        <p className="text-gray-700 mb-4">{vendor.description}</p>
                        <div className="whitespace-pre-line text-gray-700">
                          {vendor.longDescription}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {vendor.gallery.map((image, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
                          </motion.div>
                        ))}
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
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold">{vendor.rating}</span>
                          <span className="text-gray-600">({vendor.reviewCount})</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {vendor.reviews.map((review, index) => (
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
                                    {new Date(review.date).toLocaleDateString()}
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
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{vendor.phone}</span>
                    </a>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="break-all">{vendor.email}</span>
                    </a>
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
                    <div className="flex items-start gap-3 text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{vendor.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Years in Business</span>
                      <span className="font-semibold">{vendor.yearsInBusiness}+</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{vendor.reviewCount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold">{vendor.completionRate}%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-semibold">{vendor.responseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
