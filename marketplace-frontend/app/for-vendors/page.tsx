'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Users,
  Settings,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Briefcase,
  MessageSquare,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const benefits = [
  {
    icon: Users,
    title: 'Premium Clientele',
    description: 'Connect with discerning homeowners who value high-end design, craftsmanship, and are ready to invest in quality.',
  },
  {
    icon: Settings,
    title: 'Seamless Management',
    description: 'Utilize our built-in tools for managing project scopes, sending professional quotes, and tracking milestones in one place.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Work with peace of mind. Our platform guarantees milestone-based payments so you can focus entirely on your craft.',
  },
];

export default function ForVendorsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2621] flex flex-col font-body selection:bg-[#EEDDCC] selection:text-[#2C2621]">
      <Header />

      <main className="flex-grow">
        {/* Phase 1: Premium Hero Section */}
        <section className="relative pt-6 sm:pt-12 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-[#CDC0B0]/20">
          {/* Subtle warm background blurs */}
          <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-[#EEDDCC]/40 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-[#C4975A]/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Hero Text Content (5 Cols on LG) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 text-left"
              >
                {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEDDCC]/60 border border-[#CDC0B0]/40 text-[#C4975A] text-xs font-semibold uppercase tracking-widest mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#C4975A] animate-pulse" />
                  For Designers & Artisans
                </div> */}

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-[#2C2621] tracking-tight leading-[1.18] mb-5">
                  Elevate Your Craft on <br className="hidden sm:block" />
                  <span className="font-accent font-normal text-[#C4975A] text-4xl sm:text-5xl lg:text-6xl pr-1">VendorHub</span>
                </h1>

                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed mb-6">
                  Join our exclusive network of elite interior designers, architects, and craftspeople. Expand your reach and acquire high-value client projects.
                </p>

                {/* Hero Key Advantages Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    'Verified Client Leads',
                    'Milestone-Based Payments',
                    'Zero Upfront Listing Fee',
                    'Dedicated Vendor Dashboard',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#EEDDCC]/70 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-[#C4975A]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#2C2621]">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-8 py-3.5 rounded-full font-medium text-sm shadow-warm hover:shadow-warm-md hover:-translate-y-0.5"
                  >
                    Apply as a Vendor
                    <ArrowRight className="w-4 h-4 text-[#C4975A]" />
                  </Link>
                  <a
                    href="#vendor-benefits"
                    className="inline-flex items-center gap-2 border border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] transition-all px-6 py-3.5 rounded-full font-medium text-sm font-medium"
                  >
                    Learn More
                  </a>
                </div>
              </motion.div>

              {/* Right Column: Larger Widescreen Hero Image (7 Cols on LG) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="lg:col-span-7 w-full"
              >
                <div className="relative w-full group">
                  {/* Ambient Golden Glow Behind Image */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#EEDDCC] via-[#C4975A]/25 to-[#EEDDCC] rounded-[2.5rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                  {/* Main Image Wrapper */}
                  <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#CDC0B0]/40 bg-white">
                    <Image
                      src="/luxury interior designer working studio Hero Image.png"
                      alt="Luxury Interior Designer Working Studio"
                      width={1400}
                      height={900}
                      priority
                      className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    />
                  </div>

                  {/* Floating Luxury Experience Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute -bottom-4 -left-3 sm:bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#CDC0B0]/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center gap-3.5 z-20"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EEDDCC]/70 flex items-center justify-center text-[#C4975A] font-bold text-lg sm:text-xl shadow-inner">
                      ★
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[#2C2621] text-xs sm:text-sm">Verified Elite Network</div>
                      <div className="text-[11px] sm:text-xs text-[#6B5E54]">Top 5% Interior Designers & Studios</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Phase 2: The VendorHub Advantage */}
        <section id="vendor-benefits" className="py-16 sm:py-24 px-4 bg-[#FDFBF7]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-2">
                Why Join Us
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621]">
                The VendorHub Advantage
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative bg-white rounded-3xl p-8 sm:p-10 border border-[#CDC0B0]/40 shadow-sm hover:shadow-xl hover:shadow-[#C4975A]/10 hover:-translate-y-2 hover:border-[#C4975A]/60 transition-all duration-500 group overflow-hidden"
                  >
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#EEDDCC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#EEDDCC]/30 flex items-center justify-center text-[#C4975A] mb-6 group-hover:scale-110 group-hover:bg-[#C4975A] group-hover:text-white group-hover:-rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#2C2621] mb-4 group-hover:text-[#C4975A] transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <p className="font-body text-[#6B5E54] leading-relaxed group-hover:text-[#3D352E] transition-colors duration-300">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Decorative Top Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4975A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Phase 3: How It Works for You (3-Step Timeline) */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative overflow-hidden">
          <div className="text-center mb-16">
            <span className="font-body text-[#C4975A] font-semibold uppercase tracking-widest text-xs sm:text-sm block mb-2">
              Simple Onboarding
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621]">
              How It Works for You
            </h2>
          </div>

          <div className="space-y-16 sm:space-y-24 relative">
            {/* Connecting Vertical Line (Desktop only) */}
            <div className="hidden md:block absolute left-1/2 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#CDC0B0] to-transparent -translate-x-1/2 z-0" />

            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -60, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="order-2 md:order-1 relative group"
              >
                <div className="relative aspect-[3/2] rounded-3xl overflow-hidden bg-[#EEDDCC]/20 border border-[#CDC0B0]/40 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src="/step1 for vendors.png"
                    alt="Create Your Storefront"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="order-1 md:order-2 text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EEDDCC] text-[#C4975A] font-heading font-bold text-xl mb-6 shadow-sm">01</div>
                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2C2621] mb-4">Create Your Storefront</h3>
                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                  Set up a premium profile showcasing your best projects, design philosophy, and areas of expertise. A stunning portfolio is your key to attracting high-end clients.
                </p>
              </motion.div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="order-1 text-center md:text-right"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EEDDCC] text-[#C4975A] font-heading font-bold text-xl mb-6 shadow-sm">02</div>
                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2C2621] mb-4">Connect & Quote</h3>
                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                  Receive qualified leads directly through our platform. Communicate with clients seamlessly and send detailed, professional quotes using our built-in tools.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="order-2 relative group"
              >
                <div className="relative aspect-[3/2] rounded-3xl overflow-hidden bg-[#EEDDCC]/20 border border-[#CDC0B0]/40 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src="/step 2 for vendors.png"
                    alt="Connect & Quote"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -60, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="order-2 md:order-1 relative group"
              >
                <div className="relative aspect-[3/2] rounded-3xl overflow-hidden bg-[#EEDDCC]/20 border border-[#CDC0B0]/40 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src="/step 3 for vendors.png"
                    alt="Deliver & Get Paid"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="order-1 md:order-2 text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EEDDCC] text-[#C4975A] font-heading font-bold text-xl mb-6 shadow-sm">03</div>
                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#2C2621] mb-4">Deliver & Get Paid</h3>
                <p className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed">
                  Execute the project focusing entirely on your craft. Our platform handles secure, milestone-based payments ensuring you are compensated promptly for your excellence.
                </p>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Phase 4: Feature Showcase (Dashboard Preview) */}
        <section className="py-20 sm:py-28 px-4 bg-white border-y border-[#CDC0B0]/20 overflow-hidden relative">
          {/* Decorative ambient elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EEDDCC]/30 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-5xl mx-auto mb-16">
              <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] mb-6 sm:whitespace-nowrap">
                All-in-One Professional Dashboard
              </h2>
              <div className="font-body text-[#6B5E54] text-base sm:text-lg leading-relaxed max-w-4xl mx-auto space-y-1 sm:space-y-0">
                <div className="block">Experience a centralized command center designed exclusively for interior design professionals.</div>
                <div className="block">Track projects, manage communications, and oversee your financials intuitively.</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative max-w-5xl mx-auto group"
            >
              {/* Ambient Golden Glow Behind Image */}
              <div className="absolute -inset-3 bg-gradient-to-r from-[#EEDDCC] via-[#C4975A]/20 to-[#EEDDCC] rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

              {/* Main Image Wrapper */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#CDC0B0]/40 bg-white">
                <Image 
                  src="/dashboardImage.png" 
                  alt="Vendor Professional Dashboard" 
                  width={1672}
                  height={941}
                  priority
                  className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01]" 
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Phase 5: Final CTA Section */}
        <section className="py-24 sm:py-32 px-4 bg-white text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#EEDDCC]/40 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] tracking-tight mb-6">
                Ready to scale your design business?
              </h2>
              <p className="font-body text-[#6B5E54] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Join our exclusive network of premium professionals and start connecting with clients who appreciate true craftsmanship.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2C2621] text-white hover:bg-[#3D352E] transition-all px-10 py-4 rounded-full font-medium text-base shadow-warm hover:shadow-warm-md hover:-translate-y-0.5"
                >
                  Start Your Application
                  <ArrowRight className="w-5 h-5 text-[#C4975A]" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#CDC0B0] text-[#2C2621] hover:bg-[#FDFBF7] hover:border-[#C4975A] transition-all px-10 py-4 rounded-full font-medium text-base hover:-translate-y-0.5"
                >
                  Contact Support
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
