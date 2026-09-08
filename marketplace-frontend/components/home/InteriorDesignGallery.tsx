'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const images = [
  { id: 1, title: 'Modern Minimalist Living', category: 'Living Room', description: 'Clean lines, subtle textures, and open-plan elegance.', src: '/living room.jpg', side: 'left' as const },
  { id: 2, title: 'Luxury Kitchen Design', category: 'Kitchen', description: 'Bespoke cabinetry, marble countertops, and warm ambient lighting.', src: '/kitchen interior.jpg', side: 'right' as const },
  { id: 3, title: 'Bespoke Bedroom Suite', category: 'Bedroom', description: 'Serene neutral tones and tailored woodwork for ultimate comfort.', src: '/bedroom .jpg', side: 'left' as const },
  { id: 4, title: 'Organic Bathroom Oasis', category: 'Bathroom', description: 'Spa-inspired marble finishes with modern minimalist hardware.', src: '/bathroom.jpg', side: 'right' as const },
];

function GalleryCard({ img, index }: { img: typeof images[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, margin: '-100px' });

  const isLeft = img.side === 'left';

  const variants = {
    hidden: isLeft
      ? { opacity: 0, x: -200, rotateY: 0 }
      : { opacity: 0, x: 200, rotateY: 90 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`relative rounded-3xl overflow-hidden group shadow-warm-lg bg-[#2C2621] aspect-[4/3] ${index % 2 === 0 ? 'md:translate-y-12' : 'md:-translate-y-4'
        }`}
      style={{ perspective: 1200 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Image */}
      <Image
        src={img.src}
        alt={img.title}
        fill
        priority
        loading="eager"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Category Tag */}
      <div className="absolute top-4 left-4 z-20">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 + index * 0.15 }}
          className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-body text-xs tracking-widest uppercase"
        >
          {img.category}
        </motion.span>
      </div>

      {/* Gradient Overlay (always visible at bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2621]/80 via-transparent to-transparent" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-[#2C2621]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 + index * 0.15, duration: 0.6 }}
        >
          <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-2 drop-shadow-lg">
            {img.title}
          </h3>
          <p className="text-[#EEDDCC] font-body text-sm line-clamp-1 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            {img.description}
          </p>
        </motion.div>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'cardShine 1.5s ease-in-out',
        }}
      />
    </motion.div>
  );
}

export function InteriorDesignGallery() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: false, margin: '-50px' });

  return (
    <section className="py-32 relative overflow-hidden bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">

        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-20 max-w-3xl mx-auto">
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEDDCC] text-[#2C2621] font-body text-sm font-semibold mb-6 shadow-warm-sm border border-[#CDC0B0]/50"
          >
            <Sparkles className="w-4 h-4 text-[#C4975A]" />
            <span>Curated Inspiration</span>
          </motion.div> */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#2C2621] mb-6 tracking-tight leading-tight"
          >
            Design That Speaks <span className="font-accent text-[#C4975A]">Volumes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg font-body text-[#6B5E54] leading-relaxed"
          >
            Discover interior design concepts brought to life by our top-rated vendor community.
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((img, idx) => (
            <GalleryCard key={img.id} img={img} index={idx} />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          {/* <Button size="lg" className="bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-full px-8 h-14 font-body text-lg shadow-warm-lg group">
            Explore All Designs
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button> */}
        </motion.div>

      </div>
    </section>
  );
}
