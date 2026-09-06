'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Interior Design',
    description: 'Bespoke spaces that reflect your personality.',
    image: 'https://images.unsplash.com/photo-1616487625407-7ce1b2dc8978?auto=format&fit=crop&q=80&w=800',
    tags: ['Residential', 'Commercial']
  },
  {
    title: 'Architecture',
    description: 'Structural brilliance combined with organic aesthetics.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    tags: ['Planning', 'Execution']
  },
  {
    title: 'Landscaping',
    description: 'Harmonious outdoor spaces for modern living.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    tags: ['Gardens', 'Patios']
  },
  {
    title: 'Renovation',
    description: 'Transforming existing spaces into modern sanctuaries.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
    tags: ['Remodeling', 'Upgrades']
  },
  {
    title: 'Custom Furniture',
    description: 'Handcrafted pieces tailored for your home.',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    tags: ['Woodwork', 'Design']
  }
];

export function ServicesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true, skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-24 bg-[#EEDDCC]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-accent text-3xl text-[#CDB79E] mb-2">Our Expertise</h2>
            <h3 className="font-heading text-4xl sm:text-5xl font-bold text-[#2C2621]">
              Curated Services
            </h3>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full border border-[#CDC0B0] flex items-center justify-center text-[#2C2621] hover:bg-[#2C2621] hover:text-[#EEDDCC] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollNext}
              className="w-12 h-12 rounded-full border border-[#CDC0B0] flex items-center justify-center text-[#2C2621] hover:bg-[#2C2621] hover:text-[#EEDDCC] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 touch-pan-y">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
              >
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="group relative h-[450px] rounded-3xl overflow-hidden bg-[#FDFBF7] shadow-warm-sm"
                >
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-[65%] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {service.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-body font-medium text-[#2C2621]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="p-6 h-[35%] flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading text-2xl font-semibold text-[#2C2621] mb-2">{service.title}</h4>
                      <p className="font-body text-sm text-[#6B5E54] line-clamp-2">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#C4975A] font-body font-medium group-hover:text-[#2C2621] transition-colors cursor-pointer">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
