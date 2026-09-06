'use client';

import { motion } from 'framer-motion';

export function CallToAction() {
  return (
    <section className="py-24 bg-[#2C2621] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3A332C_1px,transparent_1px),linear-gradient(to_bottom,#3A332C_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CDB79E]/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EEDDCC]/5 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-accent text-3xl md:text-4xl text-[#EEDDCC] mb-4">
            Begin your journey
          </h2>
          <h3 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to transform your space?
          </h3>
          <p className="font-body text-lg text-[#9C8E82] mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied homeowners and businesses finding the perfect professionals for their design and architecture needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/explore"
              className="px-8 py-4 bg-[#EEDDCC] text-[#2C2621] font-body font-semibold rounded-2xl flex items-center justify-center hover:bg-white transition-colors shadow-warm-lg"
            >
              Find a Designer
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/for-vendors"
              className="px-8 py-4 bg-transparent text-[#EEDDCC] border border-[#6B5E54] font-body font-semibold rounded-2xl flex items-center justify-center hover:bg-[#3A332C] hover:border-[#9C8E82] transition-colors"
            >
              List your Services
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
