'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FDFBF7] overflow-hidden pt-20">
      {/* Background abstract elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[100vh] bg-[#EEDDCC]/40 rounded-l-full blur-3xl -z-10 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[50vh] bg-[#CDC0B0]/20 rounded-tr-full blur-3xl -z-10 -translate-x-1/4" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-accent text-3xl md:text-4xl text-[#CDB79E] mb-4"
            >
              Elevate your living space
            </motion.p>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-[#2C2621] leading-[1.1] mb-6">
              Organic Luxury <br />
              <span className="text-[#9C8E82]">Meets Modern</span> <br />
              Design.
            </h1>
            
            <p className="font-body text-lg text-[#6B5E54] mb-10 max-w-lg leading-relaxed">
              Discover India's most exclusive marketplace for premium interior designers, architects, and bespoke home services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-[#2C2621] text-[#EEDDCC] font-body font-medium rounded-2xl flex items-center justify-center gap-3 hover:bg-[#2C2621]/90 transition-colors shadow-warm-lg"
                >
                  Explore Designers
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/for-vendors">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent text-[#2C2621] border border-[#CDC0B0] font-body font-medium rounded-2xl flex items-center justify-center hover:bg-[#E7DBCD]/30 transition-colors"
                >
                  Join as Professional
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Images Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Main large image */}
            <div className="absolute right-0 top-0 w-4/5 h-[90%] rounded-t-[100px] rounded-b-3xl overflow-hidden shadow-warm-lg">
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000" 
                alt="Modern Japandi Interior" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
              />
            </div>
            
            {/* Floating smaller image */}
            <motion.div 
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute left-0 bottom-[10%] w-2/5 h-2/5 rounded-3xl overflow-hidden shadow-warm-xl border-4 border-[#FDFBF7]"
            >
              <img 
                src="https://images.unsplash.com/photo-1616487625407-7ce1b2dc8978?auto=format&fit=crop&q=80&w=500" 
                alt="Minimalist Decor" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
