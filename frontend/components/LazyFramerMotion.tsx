"use client";
import { lazy, Suspense } from 'react';

// Lazy load framer-motion components
export const LazyMotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.div 
  }))
);

export const LazyMotionSection = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.section 
  }))
);

export const LazyMotionH1 = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.h1 
  }))
);

export const LazyMotionP = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.p 
  }))
);

// Wrapper component with fallback
export function MotionWrapper({ 
  children, 
  fallback = <div className="opacity-0" /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
