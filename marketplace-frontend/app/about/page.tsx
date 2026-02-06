'use client';

import { motion, useInView } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  Award, 
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  Handshake
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

// Counter Animation Component
function AnimatedCounter({ value, inView }: { value: string, inView: boolean }) {
  const [count, setCount] = useState(0);
  const isNumber = /^\d+$/.test(value.replace(/[+K%,]/g, ''));
  const numericValue = isNumber ? parseInt(value.replace(/[+K%,]/g, '')) : 0;
  const isK = value.includes('K');
  const hasPlus = value.includes('+');
  const isPercent = value.includes('%');

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, numericValue]);

  const displayValue = Math.floor(count);
  return (
    <>
      {isK ? `${displayValue}K` : displayValue.toLocaleString()}
      {hasPlus && '+'}
      {isPercent && '%'}
    </>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const stats = [
  { label: 'Active Vendors', value: '500+', icon: Users },
  { label: 'Happy Customers', value: '10000+', icon: Heart },
  { label: 'Services Completed', value: '25000+', icon: CheckCircle },
  { label: 'Customer Satisfaction', value: '98%', icon: Award },
];

const achievements = [
  {
    title: 'Industry Leading',
    description: 'Recognized as one of the fastest-growing service marketplaces',
    icon: TrendingUp,
  },
  {
    title: 'Award Winning',
    description: 'Best Customer Service Platform 2025',
    icon: Award,
  },
  {
    title: 'Nationwide Coverage',
    description: 'Serving customers in over 100 cities',
    icon: Globe,
  },
  {
    title: 'Verified Quality',
    description: '100% background checked and verified vendors',
    icon: Shield,
  },
];

const timeline = [
  {
    year: '2020',
    title: 'VendorHub Founded',
    description: 'Started with a vision to connect homeowners with trusted service providers',
  },
  {
    year: '2021',
    title: 'Rapid Growth',
    description: 'Expanded to 20 cities and onboarded 100+ verified vendors',
  },
  {
    year: '2022',
    title: 'Innovation Award',
    description: 'Received recognition for best customer experience platform',
  },
  {
    year: '2023',
    title: 'Nationwide Launch',
    description: 'Expanded operations to cover 100+ cities across the country',
  },
  {
    year: '2024',
    title: 'Market Leader',
    description: 'Reached 500+ vendors and 10,000+ satisfied customers',
  },
  {
    year: '2025',
    title: 'Future Ready',
    description: 'Introducing AI-powered matching and instant booking features',
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Every vendor undergoes background checks and credential verification',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get quotes within 24 hours from multiple vendors',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: DollarSign,
    title: 'Best Prices',
    description: 'Compare quotes and choose the best value for your budget',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Read reviews and ratings from real customers',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: Handshake,
    title: 'Customer Support',
    description: '24/7 support team ready to help you anytime',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Easy Booking',
    description: 'Simple, fast booking process with instant confirmation',
    color: 'from-indigo-500 to-indigo-600',
  },
];

const values = [
  {
    title: 'Trust & Transparency',
    description: 'We verify all vendors and maintain transparent pricing to build trust between customers and service providers.',
    icon: CheckCircle,
  },
  {
    title: 'Quality Service',
    description: 'Only the best vendors make it to our platform. We ensure quality through rigorous vetting and customer reviews.',
    icon: Award,
  },
  {
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We provide 24/7 support and guarantee quality workmanship on all services.',
    icon: Heart,
  },
  {
    title: 'Innovation',
    description: 'We continuously improve our platform with the latest technology to make finding and booking services effortless.',
    icon: TrendingUp,
  },
];

const team = [
  {
    name: 'John Smith',
    role: 'CEO & Founder',
    bio: '15+ years in home services industry. Former VP at ServicePro',
    initial: 'JS',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Sarah Johnson',
    role: 'Chief Operating Officer',
    bio: 'Expert in vendor relations and marketplace operations',
    initial: 'SJ',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Mike Williams',
    role: 'Chief Technology Officer',
    bio: 'Tech innovator with 20+ years in platform development',
    initial: 'MW',
    gradient: 'from-pink-500 to-pink-600',
  },
  {
    name: 'Emily Chen',
    role: 'Head of Customer Success',
    bio: 'Passionate about delivering exceptional experiences',
    initial: 'EC',
    gradient: 'from-green-500 to-green-600',
  },
];

export default function AboutPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: false, margin: '-100px' });
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-24 sm:py-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm mb-6"
              >
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Trusted Since 2020</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              >
                Building Trust in the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Service Industry
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                VendorHub is revolutionizing how people find and hire trusted service providers. 
                We're creating a transparent marketplace where quality meets convenience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/explore">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    Explore Services
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Become a Vendor
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Our Impact in Numbers</h2>
              <p className="text-blue-200 text-lg">Growing together with our community</p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white mb-4 shadow-lg">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold mb-2">
                      <AnimatedCounter value={stat.value} inView={statsInView} />
                    </div>
                    <p className="text-sm text-blue-200">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-10 border-2 border-blue-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To simplify the process of finding and hiring trusted local service providers by creating a 
                  transparent, efficient marketplace that benefits both homeowners and skilled professionals. 
                  We believe everyone deserves access to quality services without the hassle.
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-10 border-2 border-pink-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To become the most trusted and preferred platform for home services nationwide, setting new 
                  standards for quality, reliability, and customer satisfaction. We envision a future where 
                  finding the right professional is as easy as a few clicks.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">VendorHub</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're committed to providing the best experience for both customers and vendors
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">Meet Our Leadership</h2>
              <p className="text-xl text-gray-600">Passionate leaders building the future of home services</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                >
                  <div className={`w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl font-bold text-white">{member.initial}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Our Core Values</h2>
              <p className="text-xl text-gray-600">The principles that guide everything we do</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Experience the Difference?
              </h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-100 leading-relaxed">
                Join thousands of satisfied customers and vendors who trust VendorHub 
                for their service needs every day
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
                  >
                    Find Service Providers
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all"
                  >
                    List Your Services
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
