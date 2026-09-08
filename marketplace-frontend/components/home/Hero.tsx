'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const words = [
  "Interior Designer",
  "Architect",
  "Home Decor Expert",
  "Renovation Specialist"
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const handleVideoEnded = (index: number) => {
    const nextIndex = index === 0 ? 1 : 0;
    setActiveVideoIndex(nextIndex);
    
    if (nextIndex === 0 && video1Ref.current) {
      video1Ref.current.currentTime = 0;
      video1Ref.current.play();
    } else if (nextIndex === 1 && video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play();
    }
  };

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(timeout);
    }
    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-[#2C2621]">
        <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          onEnded={() => handleVideoEnded(0)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            activeVideoIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <source src="/1stVideoHeroSection.mp4" type="video/mp4" />
        </video>
        
        <video
          ref={video2Ref}
          muted
          playsInline
          onEnded={() => handleVideoEnded(1)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            activeVideoIndex === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <source src="/2ndvideoHeroSectionKitchen.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-[#2C2621]/65 z-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-accent text-3xl md:text-4xl text-[#C4975A] mb-4 drop-shadow-md"
            >
              Elevate Your Living Space
            </motion.p>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] mb-6 h-[2.5em] sm:h-[2.2em] drop-shadow-xl">
              Find Your Perfect <br />
              <div className="flex items-center justify-center mt-2">
                <span className="text-[#C4975A] text-4xl sm:text-5xl lg:text-6xl whitespace-nowrap drop-shadow-lg">
                  {words[index].substring(0, subIndex)}
                </span>
                <span className="animate-pulse text-[#C4975A] font-light text-4xl sm:text-5xl lg:text-6xl ml-1 drop-shadow-lg">|</span>
              </div>
            </h1>

            <p className="font-body text-lg md:text-xl text-white mb-10 max-w-2xl leading-relaxed drop-shadow-md">
              Discover India&apos;s curated marketplace for talented interior designers, architects, and trusted home professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-[#C4975A] text-white font-body font-medium rounded-2xl flex items-center justify-center gap-3 hover:bg-[#C4975A]/90 transition-colors shadow-warm-lg"
                >
                  Explore Designers
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/for-vendors">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-[#EEDDCC]/50 font-body font-medium rounded-2xl flex items-center justify-center hover:bg-white/10 backdrop-blur-sm transition-colors"
                >
                  Join as Professional
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verified Experts Badge (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-[10px] right-6 md:bottom-26 md:right-3 z-30"
      >
        <div className="relative p-[1px] rounded-2xl overflow-hidden shadow-warm-xl">
          {/* Animated rotating gradient border */}
          <div
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, #C4975A, #EEDDCC, #C4975A, #2C2621, #C4975A)",
              animation: "spin 4s linear infinite",
            }}
          />
          {/* Inner content */}
          <div className="relative bg-[#2C2621]/70 backdrop-blur-lg rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
            <span
              className="font-body text-xs md:text-sm font-medium tracking-widest uppercase text-center"
              style={{
                background: "linear-gradient(90deg, #EEDDCC 0%, #C4975A 50%, #EEDDCC 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}
            >
              <span className="block mb-1">Handpicked &amp;</span>
              <span className="block">Verified Experts</span>
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
