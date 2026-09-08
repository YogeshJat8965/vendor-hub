'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Search,
  MessageSquare,
  CheckCircle,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  ImageIcon,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover & Browse',
    subtitle: 'Explore Top Verified Talent',
    description: 'Explore verified professionals by category, location, and ratings. Filter portfolios to find the exact match for your aesthetic and project scope.',
    highlights: ['Verified Portfolios', 'Client Ratings', 'Location Search'],
    placeholderLabel: 'Step 1 Image: Portfolio Search & Browse',
    // Default preview placeholder image from public folder
    imageSrc: '/living room.jpg',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Connect & Collaborate',
    subtitle: 'Direct Communication & Quotes',
    description: 'Request quotes, compare detailed profiles, and communicate directly with handpicked experts to align on your budget, materials, and timeline.',
    highlights: ['Instant Quotes', 'Direct Messaging', 'Transparent Pricing'],
    placeholderLabel: 'Step 2 Image: Designer Consultation',
    // Default preview placeholder image from public folder
    imageSrc: '/kitchen interior.jpg',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Hire & Transform',
    subtitle: 'Bring Your Vision to Life',
    description: 'Choose your ideal partner, start your project with confidence, and turn your space into an architectural masterpiece. Share your review once completed.',
    highlights: ['Secure Workflows', 'Milestone Updates', 'Quality Assured'],
    placeholderLabel: 'Step 3 Image: Completed Dream Space',
    // Default preview placeholder image from public folder (using bedroom .jpg or living room design.jpg)
    imageSrc: '/living room design.jpg',
  },
];

const trustBadges = [
  {
    icon: Shield,
    title: 'Verified Experts',
    description: '100% background-checked & vetted professionals',
  },
  {
    icon: Zap,
    title: 'Quick Response',
    description: 'Connect with top vendors within 24 hours',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Satisfaction-driven project execution',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2621] flex flex-col font-body selection:bg-[#EEDDCC] selection:text-[#2C2621]">
      <Header />

      <main className="flex-grow">
        {/* Phase 1: Premium Organic Luxury Hero Section */}
        <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-[#CDC0B0]/20">
          {/* Subtle warm background blurs */}
          <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-[#EEDDCC]/40 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-[#C4975A]/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

              {/* Left Column: Hero Text Content (6 Cols) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-6 text-left"
              >
                {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEDDCC]/50 border border-[#CDC0B0]/40 text-[#C4975A] text-xs font-semibold uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simple & Seamless
                </div> */}

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-[#2C2621] tracking-tight leading-[1.2] mb-5 whitespace-nowrap">
                  How <span className="font-accent font-normal text-[#C4975A] text-4xl sm:text-5xl lg:text-6xl px-1">VendorHub</span> Works
                </h1>

                <p className="font-body text-[#6B5E54] text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                  Connecting discerning homeowners with elite interior designers, architects, and craftspeople in three effortless steps.
                </p>

                {/* Hero Key Features Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    '100% Vetted Professionals',
                    'Transparent Pricing & Quotes',
                    'Direct Vendor Messaging',
                    'Seamless Project Workflows',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#EEDDCC]/60 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#C4975A]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#2C2621]">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-8 py-3.5 rounded-full font-medium text-sm shadow-warm hover:shadow-warm-md hover:-translate-y-0.5"
                  >
                    Explore Professionals
                    <ArrowRight className="w-4 h-4 text-[#C4975A]" />
                  </Link>
                  <a
                    href="#process-steps"
                    className="inline-flex items-center gap-2 border border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] transition-all px-6 py-3.5 rounded-full font-medium text-sm"
                  >
                    See The Steps
                  </a>
                </div>
              </motion.div>

              {/* Right Column: Full Widescreen Hero Image (6 Cols, 16/10 Aspect Ratio) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="lg:col-span-6 w-full"
              >
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/11] rounded-3xl overflow-hidden shadow-warm-md border border-[#CDC0B0]/30">
                  <Image
                    src="/how it works hero img.png"
                    alt="How VendorHub Works Hero"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Phase 2: 3-Step Process Section */}
        <section id="process-steps" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative overflow-x-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-2">
              Your Path to Perfection
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621]">
              Three Simple Steps
            </h2>
            <p className="font-body text-[#6B5E54] text-base sm:text-lg whitespace-nowrap mt-3">
              From initial discovery to final transformation, here is how we bring your dream spaces to reality.
            </p>
          </div>

          {/* Direct Step Images with Modern Hover & Scroll Effects */}
          <div className="space-y-10 sm:space-y-14">
            {[
              { src: '/step 1.png', alt: 'Step 1: Discover & Browse' },
              { src: '/step 2.png', alt: 'Step 2: Connect & Collaborate' },
              { src: '/step 3.png', alt: 'Step 3: Hire & Transform' },
            ].map((stepImg, idx) => (
              <motion.div
                key={stepImg.src}
                initial={{ opacity: 0, y: 60, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                viewport={{ once: false, margin: '-60px' }}
                transition={{ 
                  duration: 0.7, 
                  delay: idx * 0.1, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="group relative w-full rounded-[2rem] overflow-hidden bg-white border border-[#CDC0B0]/40 shadow-warm-md hover:shadow-warm-xl hover:border-[#C4975A]/60 transition-all duration-500"
              >
                {/* Ambient Warm Glow Backlight on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C4975A]/20 via-[#EEDDCC]/40 to-[#C4975A]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none" />

                {/* Shimmer Light Reflection Sweep on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                <Image
                  src={stepImg.src}
                  alt={stepImg.alt}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-contain block group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Phase 3: Trust Strip */}
        <section className="bg-[#EEDDCC]/30 border-y border-[#CDC0B0]/30 py-12 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {trustBadges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex flex-col items-center px-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#C4975A] shadow-sm mb-4 border border-[#CDC0B0]/30">
                    <BadgeIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-[#2C2621] mb-1.5">
                    {badge.title}
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-[#6B5E54]">
                    {badge.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Phase 3: Final CTA Section */}
        <section className="py-20 sm:py-28 px-4 bg-white text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#EEDDCC]/30 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                Ready to begin?
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] tracking-tight mb-4">
                Start Your Journey Today
              </h2>
              <p className="font-body text-[#6B5E54] text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Whether you are planning a dream renovation or looking to showcase your craft, VendorHub is here to connect you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-8 py-3.5 rounded-full font-medium text-sm shadow-warm hover:shadow-warm-md hover:-translate-y-0.5"
                >
                  Explore Professionals
                  <ArrowRight className="w-4 h-4 text-[#C4975A]" />
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] hover:border-[#C4975A] transition-all px-8 py-3.5 rounded-full font-medium text-sm hover:-translate-y-0.5"
                >
                  Join as a Vendor
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
