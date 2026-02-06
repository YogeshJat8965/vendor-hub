'use client';

import { motion, useInView } from 'framer-motion';
import { Search, Shield, Zap, Star, ArrowRight, CheckCircle, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Counter Animation Component
function AnimatedCounter({ value, inView }: { value: string, inView: boolean }) {
  const [count, setCount] = useState(0);
  const isNumber = /^\d+$/.test(value.replace(/[+K]/g, ''));
  const numericValue = isNumber ? parseInt(value.replace(/[+K]/g, '')) : 0;
  const isK = value.includes('K');
  const hasPlus = value.includes('+');
  const isDecimal = value.includes('.');

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const end = isDecimal ? parseFloat(value) : numericValue;
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
  }, [inView, numericValue, isDecimal, value]);

  if (isDecimal) {
    return <>{count.toFixed(1)}</>;
  }

  const displayValue = Math.floor(count);
  return (
    <>
      {isK ? `${displayValue}K` : displayValue}
      {hasPlus && '+'}
    </>
  );
}

export default function HomePage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: false, margin: '-100px' });
  
  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All vendors are thoroughly vetted and verified for your safety',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'Get quotes within minutes and hire the best vendor for your needs',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Read genuine reviews from real customers before making a decision',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Vendors', value: '500+' },
    { icon: TrendingUp, label: 'Quotes Sent', value: '10K+' },
    { icon: Award, label: 'Average Rating', value: '4.8' },
    { icon: CheckCircle, label: 'Happy Customers', value: '8K+' },
  ];

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-20 sm:py-24 lg:py-28">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm mb-8"
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Trusted by 10,000+ customers nationwide
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Find Trusted Local
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Service Providers
                </span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Connect with verified professionals for home services, repairs, and business solutions. Quality service at your fingertips.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              >
                {/* Customer Button */}
                <Link href="/login?role=customer" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-[240px] h-[56px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Users className="w-5 h-5" />
                    <span>I'm a Customer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                {/* Vendor Button */}
                <Link href="/login?role=vendor" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-[240px] h-[56px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Award className="w-5 h-5" />
                    <span>I'm a Vendor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-center mb-12"
              >
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
              >
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Vendors</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">10,000+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-3 shadow-lg">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8/5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Trusted by Thousands</h2>
              <p className="text-blue-200 text-lg">Our numbers speak for themselves</p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2">
                    <AnimatedCounter value={stat.value} inView={statsInView} />
                  </div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">VendorHub</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your trusted platform for finding and hiring local service providers
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                >
                  <div className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers finding the perfect vendors for their needs
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 touch-target"
                asChild
              >
                <Link href="/explore">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
