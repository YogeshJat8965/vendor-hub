'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle,
  Paintbrush,
  Compass,
  Award,
  ShieldCheck,
  Heart,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  FileCheck,
  Users,
  Linkedin,
  Twitter,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2621] flex flex-col font-body selection:bg-[#EEDDCC] selection:text-[#2C2621]">
      <Header />

      <main className="flex-grow">
        {/* Phase 1: Grand Cinematic Hero Section */}
        <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-[#CDC0B0]/20">
          {/* Subtle warm background ambient glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#EEDDCC]/40 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-[#C4975A]/15 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            {/* Top Text Header Block */}
            <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
              {/* <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEDDCC]/60 border border-[#CDC0B0]/40 text-[#C4975A] text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#C4975A]" />
                About VendorHub • Our Vision & Legacy
              </motion.div> */}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2C2621] tracking-tight leading-[1.15] mb-6"
              >
                Where Architectural Vision Meets <br className="hidden sm:block" />
                <span className="font-accent font-normal text-[#C4975A] text-4xl sm:text-6xl lg:text-7xl pl-2">
                  Master Craftsmanship
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-body text-[#6B5E54] text-base sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
              >
                VendorHub was created as a digital haven for luxury design. We bridge the gap between discerning homeowners and verified interior designers, architects, and master artisans—redefining how bespoke spaces come to life.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-8 py-3.5 rounded-full font-medium text-sm sm:text-base shadow-warm hover:shadow-warm-md hover:-translate-y-0.5"
                >
                  Explore Verified Studios
                  <ArrowRight className="w-4 h-4 text-[#C4975A]" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 border border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] transition-all px-8 py-3.5 rounded-full font-medium text-sm sm:text-base"
                >
                  Join as a Vendor
                </Link>
              </motion.div>
            </div>

            {/* Widescreen Hero Image Showcase with Ambient Glow */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative max-w-6xl mx-auto group"
            >
              {/* Ambient Golden Backlight */}
              <div className="absolute -inset-3 bg-gradient-to-r from-[#EEDDCC] via-[#C4975A]/25 to-[#EEDDCC] rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

              {/* Main Image Frame Container */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#CDC0B0]/40 bg-white">
                <Image
                  src="/heroImageForAboutUs.png"
                  alt="VendorHub Architectural & Interior Design Sanctuary"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
              </div>

              {/* Floating Luxury Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-5 left-4 sm:left-8 bg-white/95 backdrop-blur-md border border-[#CDC0B0]/40 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 z-20"
              >
                <div className="w-11 h-11 rounded-xl bg-[#EEDDCC]/70 flex items-center justify-center text-[#C4975A] font-bold text-lg shadow-inner">
                  ★
                </div>
                <div>
                  <div className="font-heading font-bold text-[#2C2621] text-xs sm:text-sm">Premier Digital Sanctuary</div>
                  <div className="text-[11px] sm:text-xs text-[#6B5E54]">Hand-Vetted Designers & Master Craftspeople</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Phase 2: The VendorHub Origin & Brand Story Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F5F4F0] relative overflow-hidden border-b border-[#CDC0B0]/20">
          <div className="max-w-[1300px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* Left Column: Narrative & Philosophy (6 Cols) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-6 text-left"
              >
                <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                  Our Origin & Philosophy
                </span>

                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] leading-[1.2] mb-6">
                  Bridging the Gap in <br />
                  <span className="font-accent font-normal text-[#C4975A] text-4xl sm:text-5xl lg:text-6xl">
                    Luxury Interior Design
                  </span>
                </h2>

                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed mb-6">
                  For decades, finding exceptional interior designers, architects, and custom fabricators was a fragmented process plagued by word-of-mouth guesswork, opaque pricing, and unverified credentials.
                </p>


                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed mb-8">
                  Today, VendorHub serves as an exclusive ecosystem that empowers clients to discover verified luxury talent with complete clarity—while giving master artisans the platform to scale their design studios.
                </p>

                {/* Key Story Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Hand-Vetted Craftspeople',
                    'Transparent Milestone Escrow',
                    'Bespoke Project Matching',
                    'End-to-End Concierge Support'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#EEDDCC] flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-[#C4975A]" />
                      </div>
                      <span className="text-sm font-medium text-[#2C2621]">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column: High-End Craftsmanship Image (6 Cols) */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-6 w-full"
              >
                <div className="relative group">
                  {/* Ambient Glow */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#EEDDCC] via-[#C4975A]/20 to-[#EEDDCC] rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                  {/* Image Frame */}
                  <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#CDC0B0]/40 bg-white">
                    <Image
                      src="/about-brand-story.png"
                      alt="Master Craftsmanship & Design Philosophy"
                      width={1536}
                      height={1024}
                      priority
                      className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                  </div>

                  {/* Decorative Floating Corner Card */}
                  <div className="absolute -bottom-6 -right-4 sm:bottom-6 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#CDC0B0]/40 rounded-2xl p-4 shadow-xl flex items-center gap-3 z-20">
                    <div className="w-10 h-10 rounded-xl bg-[#EEDDCC]/70 flex items-center justify-center text-[#C4975A]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[#2C2621] text-xs sm:text-sm">Curated Excellence</div>
                      <div className="text-[11px] text-[#6B5E54]">Guaranteed Authentic Artisans</div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Phase 3: Core Brand Pillars / Values Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#CDC0B0]/20 relative overflow-hidden">
          {/* Subtle Ambient Background Elements */}
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#EEDDCC]/30 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-[1300px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                Our Core Pillars
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] mb-6">
                The Standards That Define Us
              </h2>
              <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                Every feature, interaction, and project on VendorHub is anchored in our commitment to architectural excellence, complete transparency, and client peace of mind.
              </p>
            </div>

            {/* 4 Interactive Value Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              {[
                {
                  icon: Award,
                  title: 'Uncompromising Artistry',
                  subtitle: 'Top 5% Hand-Vetted Studios',
                  description: 'We rigorously audit every designer, architect, and craftsman against strict quality benchmarks before granting sanctuary access.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Absolute Transparency',
                  subtitle: 'Zero Hidden Markups',
                  description: 'Direct studio-to-client collaboration with milestone-based escrow payments that guarantee financial peace of mind.'
                },
                {
                  icon: Heart,
                  title: 'Concierge Care',
                  subtitle: 'Personalized Project Support',
                  description: 'Dedicated design concierge specialists guide both homeowners and studios from initial consultation to final space handover.'
                },
                {
                  icon: Zap,
                  title: 'Digital Innovation',
                  subtitle: 'AI Aesthetic Matching',
                  description: 'Utilizing smart matching technology, digital quote comparisons, and real-time project milestone tracking tools.'
                }
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative bg-[#F5F4F0] rounded-3xl p-8 sm:p-10 border border-[#CDC0B0]/40 shadow-sm hover:shadow-2xl hover:shadow-[#C4975A]/15 hover:-translate-y-2 hover:border-[#C4975A]/60 transition-all duration-500 group overflow-hidden flex flex-col justify-between"
                  >
                    {/* Hover Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-[#EEDDCC]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-[#EEDDCC]/60 flex items-center justify-center text-[#C4975A] mb-6 group-hover:scale-110 group-hover:bg-[#C4975A] group-hover:text-white group-hover:-rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Title & Subtitle */}
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C4975A] block mb-1">
                        {pillar.subtitle}
                      </span>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#2C2621] mb-4 group-hover:text-[#C4975A] transition-colors duration-300">
                        {pillar.title}
                      </h3>

                      {/* Description */}
                      <p className="font-body text-[#6B5E54] text-sm leading-relaxed group-hover:text-[#3D352E] transition-colors duration-300">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Decorative Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4975A] to-[#EEDDCC] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Phase 4: Our Quality & Trust Process Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F5F4F0] border-b border-[#CDC0B0]/20 relative overflow-hidden">
          <div className="max-w-[1300px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                Seamless Collaboration
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] mb-6">
                Our Quality & Trust Process
              </h2>
              <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                A transparent, step-by-step framework connecting homeowners with experienced interior designers and architectural professionals.
              </p>
            </div>

            {/* Grid Layout: Left 4 Steps List (5 Cols), Right Wide Process Image (7 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              
              {/* Left Column: 4 Steps List (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                {[
                  {
                    num: '01',
                    icon: ShieldCheck,
                    title: 'Profile & Business Verification',
                    description: 'We verify vendor details and business profiles to ensure you connect with authentic, legitimate professionals.'
                  },
                  {
                    num: '02',
                    icon: CheckCircle2,
                    title: 'Authentic Portfolio Showcase',
                    description: 'Vendors display real past projects and design portfolios so you can easily review their aesthetic and craftsmanship.'
                  },
                  {
                    num: '03',
                    icon: FileCheck,
                    title: 'Direct & Transparent Quotes',
                    description: 'Receive itemized project estimates directly from vendors with zero hidden markups or ambiguous fees.'
                  },
                  {
                    num: '04',
                    icon: Star,
                    title: 'Verified Client Reviews',
                    description: 'Real feedback and star ratings from completed projects help you choose the right partner with confidence.'
                  }
                ].map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={stage.num}
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-white rounded-2xl p-5 sm:p-5 border border-[#CDC0B0]/40 shadow-sm hover:shadow-xl hover:border-[#C4975A]/60 transition-all duration-300 group flex items-start gap-4 flex-1"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#EEDDCC]/60 flex items-center justify-center text-[#C4975A] font-heading font-bold text-base sm:text-lg flex-shrink-0 group-hover:bg-[#C4975A] group-hover:text-white transition-colors duration-300 mt-0.5">
                        {stage.num}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base sm:text-lg text-[#2C2621] mb-1.5 group-hover:text-[#C4975A] transition-colors duration-300">
                          {stage.title}
                        </h3>
                        <p className="font-body text-[#4A3E35] text-sm sm:text-base leading-relaxed font-normal">
                          {stage.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Column: Process Image (7 Cols - Expanded Width & Full Height Matched) */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 w-full h-full flex flex-col"
              >
                <div className="relative group h-full flex flex-col">
                  {/* Ambient Glow */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#EEDDCC] via-[#C4975A]/20 to-[#EEDDCC] rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                  {/* Main Image Frame Container */}
                  <div className="relative w-full h-full min-h-[420px] lg:min-h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#CDC0B0]/40 bg-white">
                    <Image
                      src="/about-vetting-process.png"
                      alt="VendorHub Quality & Trust Process"
                      fill
                      priority
                      className="object-cover object-center block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Floating Experience Badge */}
                  <div className="absolute -bottom-5 left-4 sm:left-6 bg-white/95 backdrop-blur-md border border-[#CDC0B0]/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center gap-3 z-20">
                    <div className="w-10 h-10 rounded-xl bg-[#EEDDCC]/70 flex items-center justify-center text-[#C4975A]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[#2C2621] text-xs sm:text-sm">Verified Vendor Profiles</div>
                      <div className="text-[11px] text-[#6B5E54]">Rated by Real Clients</div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Phase 5: Leadership & Editorial Curators Team Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#CDC0B0]/20 relative overflow-hidden">
          <div className="max-w-[1300px] mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                Leadership & Curation
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] mb-6">
                The Minds Behind VendorHub
              </h2>
              <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                A dedicated team of architectural curators, technology innovators, and design industry veterans guiding our sanctuary.
              </p>
            </div>

            {/* Team Grid (4 Members) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              {[
                {
                  name: 'Alexander Vance',
                  role: 'Founder & Chief Executive Officer',
                  bio: 'Former Principal Architect with 15+ years in luxury residential design. Dedicated to empowering independent studios.',
                  filename: 'team-founder.png',
                  recType: 'Professional portrait of male founder in a modern architectural studio backdrop.'
                },
                {
                  name: 'Elena Rostova',
                  role: 'Head of Architectural Curation',
                  bio: 'Award-winning interior curator with deep expertise in European furniture, bespoke joinery, and rare material sourcing.',
                  filename: 'team-curator.png',
                  recType: 'Elegant portrait of female head curator holding material swatches or design sketch.'
                },
                {
                  name: 'Marcus Sterling',
                  role: 'Chief Technology Officer',
                  bio: 'Pioneer in marketplace platform architecture & AI matching, bringing digital elegance to luxury commerce.',
                  filename: 'team-cto.png',
                  recType: 'Modern tech leader portrait in a lit studio office environment.'
                },
                {
                  name: 'Sophia Chen',
                  role: 'Head of Client & Vendor Concierge',
                  bio: 'Over a decade in hospitality & luxury project management, ensuring seamless collaboration from inquiry to handover.',
                  filename: 'team-concierge.png',
                  recType: 'Warm, professional portrait of female concierge lead.'
                }
              ].map((member, idx) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#F5F4F0] rounded-3xl overflow-hidden border border-[#CDC0B0]/40 shadow-sm hover:shadow-2xl hover:border-[#C4975A]/60 transition-all duration-500 group flex flex-col justify-between"
                >
                  {/* Member Image Container with Placeholder Guidance */}
                  <div className="relative w-full aspect-[4/5] bg-white overflow-hidden flex flex-col items-center justify-center border-b border-[#CDC0B0]/30">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center z-10 bg-white/80 backdrop-blur-md">
                      <div className="w-10 h-10 rounded-xl bg-[#EEDDCC]/70 flex items-center justify-center text-[#C4975A] mb-2 shadow-inner">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-[#C4975A] tracking-widest uppercase mb-1">Image Placeholder</p>
                      <p className="text-xs text-[#2C2621] font-bold mb-1">
                        <code className="bg-white/90 px-2 py-0.5 rounded border border-[#CDC0B0]/40 font-mono text-[11px] text-[#C4975A]">{member.filename}</code>
                      </p>
                      <p className="text-[11px] text-[#6B5E54] leading-tight mt-1">
                        {member.recType}
                      </p>
                    </div>

                    <Image
                      src={`/${member.filename}`}
                      alt={member.name}
                      fill
                      className="object-cover z-0 opacity-0 transition-opacity duration-500 group-hover:scale-105"
                      onLoadingComplete={(e) => e.classList.remove('opacity-0')}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Member Info Block */}
                  <div className="p-6 sm:p-7 text-left flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C4975A] block mb-1">
                        {member.role}
                      </span>
                      <h3 className="font-heading font-bold text-xl text-[#2C2621] mb-3 group-hover:text-[#C4975A] transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="font-body text-[#6B5E54] text-xs sm:text-sm leading-relaxed mb-6">
                        {member.bio}
                      </p>
                    </div>

                    {/* Social / Contact Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-[#CDC0B0]/30 text-[#6B5E54]">
                      <a href="#" className="hover:text-[#C4975A] transition-colors p-1.5 rounded-lg hover:bg-[#EEDDCC]/40">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="#" className="hover:text-[#C4975A] transition-colors p-1.5 rounded-lg hover:bg-[#EEDDCC]/40">
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="hover:text-[#C4975A] transition-colors p-1.5 rounded-lg hover:bg-[#EEDDCC]/40">
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 6: Final Dual-Path Luxury Call to Action Section */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#F5F4F0] text-center relative overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#EEDDCC]/50 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-[1300px] mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-3">
                Begin Your Journey
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] mb-6 sm:whitespace-nowrap">
                Step Into the VendorHub Sanctuary
              </h2>
              <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                Whether you are seeking to build your architectural masterpiece or expand your design studio, VendorHub is built for you.
              </p>
            </motion.div>

            {/* Dual-Path Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">

              {/* Card 1: For Homeowners */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl p-8 sm:p-12 border border-[#CDC0B0]/40 shadow-xl hover:shadow-2xl hover:border-[#C4975A]/60 transition-all duration-500 text-left flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C4975A] to-[#EEDDCC]" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#EEDDCC]/60 flex items-center justify-center text-[#C4975A] mb-6 group-hover:scale-110 group-hover:bg-[#C4975A] group-hover:text-white transition-all duration-300 shadow-sm">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C4975A] block mb-2">
                    For Homeowners & Estates
                  </span>
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2C2621] mb-4">
                    Transform Your Architectural Space
                  </h3>
                  <p className="font-body text-[#6B5E54] text-base leading-relaxed mb-8">
                    Explore verified luxury interior designers, architects, and custom artisans. Request transparent quotes and collaborate with complete peace of mind.
                  </p>
                </div>

                <div>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-8 py-4 rounded-full font-medium text-sm sm:text-base shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    Explore Verified Studios
                    <ArrowRight className="w-4 h-4 text-[#C4975A]" />
                  </Link>
                </div>
              </motion.div>

              {/* Card 2: For Vendors */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl p-8 sm:p-12 border border-[#CDC0B0]/40 shadow-xl hover:shadow-2xl hover:border-[#C4975A]/60 transition-all duration-500 text-left flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2C2621] to-[#C4975A]" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#EEDDCC]/60 flex items-center justify-center text-[#C4975A] mb-6 group-hover:scale-110 group-hover:bg-[#C4975A] group-hover:text-white transition-all duration-300 shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C4975A] block mb-2">
                    For Designers & Artisans
                  </span>
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2C2621] mb-4">
                    Elevate Your Design Studio
                  </h3>
                  <p className="font-body text-[#6B5E54] text-base leading-relaxed mb-8">
                    Join our exclusive network of hand-vetted professionals. Connect with high-value clients, send professional quotes, and secure your milestone payments.
                  </p>
                </div>

                <div>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 bg-[#C4975A] text-white hover:bg-[#B38649] transition-all px-8 py-4 rounded-full font-medium text-sm sm:text-base shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    Apply as an Elite Vendor
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
