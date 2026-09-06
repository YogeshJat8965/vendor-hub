'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Scroll3DWrapper } from '@/components/ui/scroll-3d-wrapper';

const images = [
  { id: 1, title: 'Modern Minimalist Living', desc: 'Placeholder: Add a beautiful interior design image here (Living Room)' },
  { id: 2, title: 'Luxury Kitchen Design', desc: 'Placeholder: Add a premium kitchen interior image here' },
  { id: 3, title: 'Bespoke Bedroom Suite', desc: 'Placeholder: Add an elegant bedroom interior image here' },
  { id: 4, title: 'Organic Bathroom Oasis', desc: 'Placeholder: Add a spa-like bathroom interior image here' },
];

export function InteriorDesignGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden bg-[#FDFBF7] perspective-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        <Scroll3DWrapper depth={30}>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEDDCC] text-[#2C2621] font-body text-sm font-semibold mb-6 shadow-warm-sm border border-[#CDC0B0]/50"
            >
              <Sparkles className="w-4 h-4 text-[#C4975A]" />
              <span>Curated Inspiration</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#2C2621] mb-6 tracking-tight leading-tight">
              Design That Speaks <br className="hidden md:block" />
              <span className="italic font-light text-[#C4975A]">Volumes</span>
            </h2>
            <p className="text-lg font-body text-[#6B5E54] leading-relaxed">
              Discover interior design concepts brought to life by our top-rated vendor community.
            </p>
          </div>
        </Scroll3DWrapper>

        {/* 3D Scrolling Gallery */}
        <motion.div
          style={{ scale, rotateX }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 transform-style-3d"
        >
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              className={`relative rounded-3xl overflow-hidden group shadow-warm-lg bg-[#EEDDCC]/20 border border-[#CDC0B0]/30 aspect-[4/3] ${
                idx % 2 === 0 ? 'md:translate-y-12' : 'md:-translate-y-4'
              }`}
              whileHover={{ scale: 1.02, rotateY: idx % 2 === 0 ? 2 : -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Image Placeholder Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[#CDC0B0]/50 rounded-3xl m-4 bg-[#FDFBF7]/50 backdrop-blur-sm transition-all group-hover:border-[#C4975A]/50">
                <span className="text-[#C4975A] font-heading text-lg mb-2 opacity-50 group-hover:opacity-100 transition-opacity">Image Placeholder</span>
                <p className="font-body text-[#9C8E82] text-sm max-w-xs">{img.desc}</p>
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2621]/90 via-[#2C2621]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                >
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">{img.title}</h3>
                  <Button variant="link" className="text-[#EEDDCC] hover:text-white p-0 h-auto font-body flex items-center gap-2 group/btn">
                    View Project <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Scroll3DWrapper depth={-20} className="mt-32 text-center">
          <Button size="lg" className="bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-full px-8 h-14 font-body text-lg shadow-warm-lg group">
            Explore All Designs
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Scroll3DWrapper>

      </div>
    </section>
  );
}
