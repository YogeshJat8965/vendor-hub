'use client';

import { motion } from 'framer-motion';
import { Star, Shield, Award, Sparkles, CheckCircle } from 'lucide-react';

const features = [
  { icon: Star, text: "Top-Rated Designers" },
  { icon: Shield, text: "Verified Professionals" },
  { icon: Award, text: "Award-Winning Portfolios" },
  { icon: Sparkles, text: "Bespoke Solutions" },
  { icon: CheckCircle, text: "Secure Payments" },
];

export function TrustMarquee() {
  return (
    <section className="bg-[#2C2621] py-8 overflow-hidden border-y border-[#3A332C]">
      <div className="relative flex w-full">
        {/* Gradient Masks for smooth fading edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#2C2621] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#2C2621] to-transparent z-10" />
        
        {/* Marquee Content */}
        <div className="flex animate-marquee whitespace-nowrap">
          {/* Double the items to create seamless loop */}
          {[...features, ...features, ...features].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 px-12 group cursor-default"
              >
                <Icon className="w-5 h-5 text-[#CDB79E] group-hover:text-[#EEDDCC] transition-colors" />
                <span className="font-heading text-[#9C8E82] group-hover:text-[#EEDDCC] transition-colors text-lg tracking-wide">
                  {feature.text}
                </span>
                <span className="text-[#3A332C] mx-8 text-xl">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
