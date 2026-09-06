'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Scroll3DWrapperProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function Scroll3DWrapper({ children, className = '', depth = 50 }: Scroll3DWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}
