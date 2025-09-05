"use client";
import { Suspense, lazy } from 'react';

// Lazy load framer-motion only when needed
const MotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.div 
  }))
);

const MotionH1 = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.h1 
  }))
);

const MotionP = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.p 
  }))
);

// Fallback components for loading states
const HeroFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ea] via-[#e7dac7] to-[#b7a16c]">
    <div className="text-center px-4">
      <div className="h-16 bg-gray-200 rounded mb-6 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

interface OptimizedAnimatedHeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function OptimizedAnimatedHero({ 
  title, 
  subtitle, 
  ctaText, 
  onCtaClick 
}: OptimizedAnimatedHeroProps) {
  return (
    <Suspense fallback={<HeroFallback />}>
      <MotionDiv
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f3ea] via-[#e7dac7] to-[#b7a16c] relative overflow-hidden"
      >
        <div className="text-center px-4 z-10">
          <MotionH1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-[#2c1810] mb-6 font-playfair"
          >
            {title}
          </MotionH1>
          
          <MotionP
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-[#5d4e37] mb-8 max-w-2xl mx-auto"
          >
            {subtitle}
          </MotionP>
          
          {ctaText && (
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={onCtaClick}
                className="bg-[#8b7355] hover:bg-[#6d5a42] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                {ctaText}
              </button>
            </MotionDiv>
          )}
        </div>
      </MotionDiv>
    </Suspense>
  );
}
